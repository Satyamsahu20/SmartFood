import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)

  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  /* ======================= GEOLOCATION FIX ======================= */
  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return

    let watchId

    if ("geolocation" in navigator) {
      // 1️⃣ Get initial location immediately
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          setDeliveryBoyLocation({ lat: latitude, lon: longitude })

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id
          })
        },
        (error) => {
          console.error("Initial location error:", error)
        },
        { enableHighAccuracy: true }
      )

      // 2️⃣ Watch continuous location
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          setDeliveryBoyLocation({ lat: latitude, lon: longitude })

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id
          })
        },
        (error) => {
          console.error("Watch position error:", error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 20000
        }
      )
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData])
  /* =============================================================== */

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  )

  const getAssignments = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-assignments`,
        { withCredentials: true }
      )
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      )
      setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true }
      )
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!socket) return

    socket.on('newAssignment', (data) => {
      setAvailableAssignments(prev => [...(prev || []), data])
    })

    return () => socket.off('newAssignment')
  }, [socket])

  const sendOtp = async () => {
    setLoading(true)
    try {
      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id
        },
        { withCredentials: true }
      )
      setShowOtpBox(true)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp
        },
        { withCredentials: true }
      )
      setMessage(result.data.message)
      window.location.reload()
    } catch (error) {
      console.log(error)
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true }
      )
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (userData) {
      getAssignments()
      getCurrentOrder()
      handleTodayDeliveries()
    }
  }, [userData])

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-[#fff9f6]">
      <Nav />

      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] text-center">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData.fullName}
          </h1>

          {deliveryBoyLocation ? (
            <p className="text-[#ff4d2d]">
              <b>Lat:</b> {deliveryBoyLocation.lat} | <b>Lon:</b> {deliveryBoyLocation.lon}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Fetching live location…</p>
          )}
        </div>

        {currentOrder && (
          <DeliveryBoyTracking
            data={{
              deliveryBoyLocation:
                deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0]
                },
              customerLocation: {
                lat: currentOrder.deliveryAddress.latitude,
                lon: currentOrder.deliveryAddress.longitude
              }
            }}
          />
        )}

        {/* Rest of your UI (orders, OTP, charts) remains unchanged */}
      </div>
    </div>
  )
}

export default DeliveryBoy
