import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { ClipLoader } from "react-spinners";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);

  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================================================
     1️⃣ JOIN GLOBAL DELIVERY BOY ROOM (LOCATION INDEPENDENT)
     ========================================================= */
  useEffect(() => {
    if (socket && userData?.role === "deliveryBoy") {
      socket.emit("joinDeliveryBoy", userData._id);
    }
  }, [socket, userData]);

  /* =========================================================
     2️⃣ RECEIVE NEW ASSIGNMENTS (REAL-TIME)
     ========================================================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("newAssignment", (data) => {
      setAvailableAssignments((prev) => [...prev, data]);
    });

    return () => socket.off("newAssignment");
  }, [socket]);

  /* =========================================================
     3️⃣ OPTIONAL GEOLOCATION (ONLY FOR MAP, NOT FOR ORDERS)
     ========================================================= */
  useEffect(() => {
    let watchId;

    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryBoyLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Location permission denied. Continuing without GPS.");
      },
      { enableHighAccuracy: true }
    );

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDeliveryBoyLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  /* ========================================================= */

  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  );

  const getAssignments = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/order/get-assignments`,
        { withCredentials: true }
      );
      setAvailableAssignments(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      );
      await getCurrentOrder();
    } catch (err) {
      console.log(err);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true }
      );
      setShowOtpBox(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    try {
      const res = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true }
      );
      setMessage(res.data.message);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      );
      setTodayDeliveries(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userData) {
      getAssignments();
      getCurrentOrder();
      handleTodayDeliveries();
    }
  }, [userData]);

  /* ========================================================= */

  return (
    <div className="w-screen min-h-screen bg-[#fff9f6]">
      <Nav />

      <div className="max-w-[800px] mx-auto flex flex-col gap-5 items-center">
        <div className="bg-white p-5 rounded-2xl shadow-md w-[90%] text-center">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData.fullName}
          </h1>

          {deliveryBoyLocation ? (
            <p className="text-sm text-[#ff4d2d]">
              Lat: {deliveryBoyLocation.lat} | Lon:{" "}
              {deliveryBoyLocation.lon}
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Location not required for orders
            </p>
          )}
        </div>

        {/* MAP (OPTIONAL) */}
        {currentOrder && deliveryBoyLocation && (
          <DeliveryBoyTracking
            data={{
              deliveryBoyLocation,
              customerLocation: {
                lat: currentOrder.deliveryAddress.latitude,
                lon: currentOrder.deliveryAddress.longitude,
              },
            }}
          />
        )}

        {/* AVAILABLE ORDERS */}
        {!currentOrder && (
          <div className="bg-white w-[90%] p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Available Orders</h2>

            {availableAssignments.length === 0 && (
              <p className="text-gray-400 text-sm">
                No available orders
              </p>
            )}

            {availableAssignments.map((a, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 flex justify-between items-center mb-3"
              >
                <div>
                  <p className="font-semibold">{a.shopName}</p>
                  <p className="text-xs text-gray-500">
                    {a.deliveryAddress.text}
                  </p>
                </div>
                <button
                  onClick={() => acceptOrder(a.assignmentId)}
                  className="bg-orange-500 text-white px-4 py-1 rounded-lg"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
