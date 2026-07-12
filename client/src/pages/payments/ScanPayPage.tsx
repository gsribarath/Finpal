import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ArrowLeft,
  Smartphone,
  Store,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Zap,
  Camera,
  CameraOff,
  Image,
  Sparkles,
} from 'lucide-react'
import { paymentApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface PaymentFormData {
  amount: string
  merchant: string
  description: string
}

interface MerchantQrMetadata {
  merchantId?: string
  merchantName?: string
  upiId?: string
  category?: string
  subcategory?: string
  city?: string
  state?: string
  merchantType?: string
  verified?: boolean
}

interface ParsedMerchantScanData {
  kind: 'structured' | 'upi'
  merchantName: string
  upiId?: string
  category?: string
  subcategory?: string
  city?: string
  state?: string
  merchantType?: string
  merchantId?: string
  verified?: boolean
  upi?: ParsedUpiData
  rawText: string
}

interface ParsedUpiData {
  pa?: string
  pn?: string
  am?: string
  tn?: string
  cu?: string
  mc?: string
  tr?: string
  url?: string
}

interface ImagePreprocessOptions {
  rotateDegrees?: number
  cropRatio?: number
  contrast?: number
  brightness?: number
  grayscale?: boolean
  threshold?: boolean
}

const DEMO_MERCHANT_PROFILE = {
  merchantId: 'FPM00001',
  merchantName: 'SARAVANA BHAVAN',
  upiId: 'saravanabhavan@okaxis',
  category: 'Food',
  subcategory: 'Restaurant',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  merchantType: 'Restaurant',
  verified: true,
} as const

function normalizeMerchantText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9@]+/g, '')
}

function isDemoMerchantValue(value?: string): boolean {
  if (!value) return false
  const normalized = normalizeMerchantText(value)
  return normalized.includes('saravanabhavan') || normalized.includes('saravanabhavan@okaxis') || normalized.includes('fpm00001')
}

function applyDemoMerchantMetadata(base: Partial<ParsedMerchantScanData> & { rawText: string }): ParsedMerchantScanData {
  return {
    kind: base.kind || 'structured',
    merchantName: DEMO_MERCHANT_PROFILE.merchantName,
    upiId: DEMO_MERCHANT_PROFILE.upiId,
    category: DEMO_MERCHANT_PROFILE.category,
    subcategory: DEMO_MERCHANT_PROFILE.subcategory,
    city: DEMO_MERCHANT_PROFILE.city,
    state: DEMO_MERCHANT_PROFILE.state,
    merchantType: DEMO_MERCHANT_PROFILE.merchantType,
    merchantId: DEMO_MERCHANT_PROFILE.merchantId,
    verified: DEMO_MERCHANT_PROFILE.verified,
    upi: base.upi,
    rawText: base.rawText,
  }
}

function isLikelyBlurry(image: HTMLImageElement | ImageBitmap): boolean {
  const width = 'naturalWidth' in image ? image.naturalWidth : image.width
  const height = 'naturalHeight' in image ? image.naturalHeight : image.height
  return width < 220 || height < 220
}

async function fileToImageBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    return await createImageBitmap(file)
  }

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = URL.createObjectURL(file)
  })
}

async function preprocessQrImage(file: File, options: ImagePreprocessOptions = {}): Promise<Blob> {
  const image = await fileToImageBitmap(file)
  const baseWidth = 'naturalWidth' in image ? image.naturalWidth : image.width
  const baseHeight = 'naturalHeight' in image ? image.naturalHeight : image.height
  const rotateDegrees = options.rotateDegrees || 0
  const cropRatio = options.cropRatio || 1
  const outputWidth = Math.max(320, Math.round(baseWidth * cropRatio))
  const outputHeight = Math.max(320, Math.round(baseHeight * cropRatio))

  const canvas = document.createElement('canvas')
  canvas.width = rotateDegrees % 180 === 0 ? outputWidth : outputHeight
  canvas.height = rotateDegrees % 180 === 0 ? outputHeight : outputWidth
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotateDegrees * Math.PI) / 180)
  const drawWidth = outputWidth
  const drawHeight = outputHeight
  const sourceWidth = baseWidth * cropRatio
  const sourceHeight = baseHeight * cropRatio
  const sourceX = (baseWidth - sourceWidth) / 2
  const sourceY = (baseHeight - sourceHeight) / 2

  ctx.filter = `contrast(${options.contrast ?? 1.25}) brightness(${options.brightness ?? 1.05}) ${options.grayscale ? 'grayscale(1)' : ''}`.trim()
  ctx.drawImage(
    image as CanvasImageSource,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  )
  ctx.restore()

  if (options.threshold) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    for (let index = 0; index < pixels.length; index += 4) {
      const luminance = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114
      const value = luminance > 168 ? 255 : 0
      pixels[index] = value
      pixels[index + 1] = value
      pixels[index + 2] = value
      pixels[index + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0)
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Failed to preprocess QR image'))
      else resolve(blob)
    }, 'image/png', 1)
  })
}

async function detectQrWithBarcodeDetector(source: ImageBitmap | HTMLImageElement): Promise<string | null> {
  const BarcodeDetectorCtor = (window as any).BarcodeDetector
  if (!BarcodeDetectorCtor) return null

  try {
    const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] })
    const results = await detector.detect(source)
    return results?.[0]?.rawValue || null
  } catch {
    return null
  }
}

async function decodeQrImageFile(file: File): Promise<string> {
  if (!html5QrcodeRefGlobal.current) throw new Error('QR decoder unavailable')

  const attemptFiles: File[] = [file]
  const baseVariants: ImagePreprocessOptions[] = [
    { grayscale: true, contrast: 1.4, brightness: 1.05 },
    { grayscale: true, contrast: 1.8, brightness: 1.1, threshold: true },
  ]

  const baseImage = await fileToImageBitmap(file)

  const directDetectorResult = await detectQrWithBarcodeDetector(baseImage)
  if (directDetectorResult) return directDetectorResult

  for (const variant of baseVariants) {
    try {
      const blob = await preprocessQrImage(file, variant)
      attemptFiles.push(new File([blob], 'processed-qr.png', { type: 'image/png' }))
    } catch {
      // Ignore preprocessing failures and continue with the original file
    }
  }

  const rotations: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270]
  const crops = [1, 0.92, 0.8]

  for (const attemptFile of attemptFiles) {
    for (const cropRatio of crops) {
      for (const rotateDegrees of rotations) {
        try {
          const blob = attemptFile === file && cropRatio === 1 && rotateDegrees === 0
            ? null
            : await preprocessQrImage(attemptFile, { cropRatio, rotateDegrees, grayscale: true, contrast: 1.35, brightness: 1.08, threshold: cropRatio < 1 })
          const fileToScan = blob ? new File([blob], 'qr-attempt.png', { type: 'image/png' }) : attemptFile
          if (blob) {
            const blobImage = await fileToImageBitmap(fileToScan)
            const detectorResult = await detectQrWithBarcodeDetector(blobImage)
            if (detectorResult) return detectorResult
          }
          const result = await html5QrcodeRefGlobal.current.scanFile(fileToScan, true)
          if (result) return result
        } catch {
          continue
        }
      }
    }
  }

  throw new Error('Unable to read this QR. Please try another image.')
}

const html5QrcodeRefGlobal: { current: Html5Qrcode | null } = { current: null }

function parseStructuredMerchantMetadata(data: string): MerchantQrMetadata | null {
  try {
    const parsed = JSON.parse(data)
    if (!parsed || typeof parsed !== 'object') return null

    const metadata: MerchantQrMetadata = {
      merchantId: typeof parsed.merchantId === 'string' ? parsed.merchantId : undefined,
      merchantName: typeof parsed.merchantName === 'string' ? parsed.merchantName : undefined,
      upiId: typeof parsed.upiId === 'string' ? parsed.upiId : undefined,
      category: typeof parsed.category === 'string' ? parsed.category : undefined,
      subcategory: typeof parsed.subcategory === 'string' ? parsed.subcategory : undefined,
      city: typeof parsed.city === 'string' ? parsed.city : undefined,
      state: typeof parsed.state === 'string' ? parsed.state : undefined,
      merchantType: typeof parsed.merchantType === 'string' ? parsed.merchantType : undefined,
      verified: typeof parsed.verified === 'boolean' ? parsed.verified : undefined,
    }

    return Object.values(metadata).some((value) => value !== undefined && value !== '')
      ? metadata
      : null
  } catch {
    return null
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

/**
 * Parse a UPI deep link / QR code string.
 * Handles: upi://pay?..., plain UPI IDs, URL-encoded params, and
 * generic QR strings containing pa= parameter.
 */
function parseUpiString(data: string): ParsedUpiData | null {
  try {
    const trimmed = data.trim()

    // 1) Standard UPI deep link: upi://pay?pa=...&pn=...&am=...
    if (trimmed.toLowerCase().startsWith('upi://')) {
      const url = new URL(trimmed)
      const params: ParsedUpiData = {}
      url.searchParams.forEach((value, key) => {
        ;(params as any)[key.toLowerCase()] = decodeURIComponent(value)
      })
      if (params.pa) return params
    }

    // 2) Plain UPI ID (e.g. merchant@ybl, user@paytm)
    const upiIdRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}$/
    if (upiIdRegex.test(trimmed)) {
      return { pa: trimmed, pn: trimmed.split('@')[0] }
    }

    // 3) URL containing UPI params (some QR generators wrap in http URLs)
    if (trimmed.startsWith('http')) {
      try {
        const url = new URL(trimmed)
        if (url.searchParams.has('pa')) {
          const params: ParsedUpiData = {}
          url.searchParams.forEach((value, key) => {
            ;(params as any)[key.toLowerCase()] = decodeURIComponent(value)
          })
          if (params.pa) return params
        }
      } catch {}
    }

    // 4) Raw query-string with pa= (e.g. pa=merchant@upi&pn=Name&am=100)
    if (trimmed.includes('pa=')) {
      const qs = trimmed.includes('?') ? trimmed.split('?')[1] : trimmed
      const params: ParsedUpiData = {}
      const searchParams = new URLSearchParams(qs)
      searchParams.forEach((value, key) => {
        ;(params as any)[key.toLowerCase()] = decodeURIComponent(value)
      })
      if (params.pa) return params
    }

    return null
  } catch {
    return null
  }
}

function parseQrScanPayload(decodedText: string): ParsedMerchantScanData | null {
  const structured = parseStructuredMerchantMetadata(decodedText)
  if (structured) {
    const merchantName = structured.merchantName || structured.upiId || 'Merchant'
    const resolved: ParsedMerchantScanData = {
      kind: 'structured',
      merchantName,
      upiId: structured.upiId,
      category: structured.category,
      subcategory: structured.subcategory,
      city: structured.city,
      state: structured.state,
      merchantType: structured.merchantType,
      merchantId: structured.merchantId,
      verified: structured.verified,
      rawText: decodedText,
    }

    if (isDemoMerchantValue(resolved.merchantName) || isDemoMerchantValue(resolved.upiId) || isDemoMerchantValue(resolved.merchantId)) {
      return applyDemoMerchantMetadata(resolved)
    }

    return resolved
  }

  const parsedUpi = parseUpiString(decodedText)
  if (!parsedUpi || !parsedUpi.pa) return null

  if (isDemoMerchantValue(parsedUpi.pa) || isDemoMerchantValue(parsedUpi.pn) || isDemoMerchantValue(decodedText)) {
    return applyDemoMerchantMetadata({
      kind: 'upi',
      upi: parsedUpi,
      rawText: decodedText,
    })
  }

  return {
    kind: 'upi',
    merchantName: parsedUpi.pn || parsedUpi.pa,
    upiId: parsedUpi.pa,
    upi: parsedUpi,
    rawText: decodedText,
  }
}

export const ScanPayPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [scannerActive, setScannerActive] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [scannedData, setScannedData] = useState<ParsedMerchantScanData | null>(null)
  const [paymentStep, setPaymentStep] = useState<'scanning' | 'details' | 'processing' | 'success' | 'failed'>('scanning')
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const razorpayLoadingRef = useRef(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isUploadProcessing, setIsUploadProcessing] = useState(false)
  const razorpayObserverRef = useRef<MutationObserver | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<number | null>(null)
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null)
  const isProcessingRef = useRef(false)
  const cameraStartingRef = useRef(false)
  const cameraStartSeqRef = useRef(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PaymentFormData>({
    defaultValues: { amount: '', merchant: '', description: '' },
  })

  const buildMetadataNotes = useCallback((merchantName: string, upiId?: string) => {
    if (!scannedData) return undefined

    const notes: Record<string, string> = {}
    if (scannedData.merchantId) notes.merchantId = scannedData.merchantId
    if (scannedData.merchantName) notes.merchantName = scannedData.merchantName
    if (scannedData.upiId) notes.upiId = scannedData.upiId
    if (scannedData.category) notes.category = scannedData.category
    if (scannedData.subcategory) notes.subcategory = scannedData.subcategory
    if (scannedData.city) notes.city = scannedData.city
    if (scannedData.state) notes.state = scannedData.state
    if (scannedData.merchantType) notes.merchantType = scannedData.merchantType
    if (typeof scannedData.verified === 'boolean') notes.verified = scannedData.verified ? 'true' : 'false'
    notes.merchant = merchantName
    if (upiId) notes.upiId = upiId
    return Object.keys(notes).length ? notes : undefined
  }, [scannedData])

  // Load Razorpay on demand (not eagerly) to avoid SDK console noise
  const loadRazorpayScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve()
        return
      }
      if (document.getElementById('razorpay-script')) {
        // Script tag exists but hasn't loaded yet — wait for it
        const existing = document.getElementById('razorpay-script') as HTMLScriptElement
        existing.addEventListener('load', () => { resolve() })
        existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
        return
      }
      if (razorpayLoadingRef.current) return
      razorpayLoadingRef.current = true
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => { resolve() }
      script.onerror = () => { razorpayLoadingRef.current = false; reject(new Error('Failed to load Razorpay')) }
      document.body.appendChild(script)
    })
  }, [])

  /**
   * Patch Razorpay iframes with proper `allow` attributes to suppress
   * Permissions-Policy console violations (accelerometer, gyroscope, etc.).
   * Also cleans up Razorpay artifacts when the component unmounts.
   */
  useEffect(() => {
    const patchRazorpayIframes = () => {
      document.querySelectorAll('iframe').forEach((iframe) => {
        const src = iframe.src || ''
        if (
          (src.includes('razorpay.com') || src.includes('sardine.ai')) &&
          !iframe.getAttribute('data-rzp-patched')
        ) {
          iframe.allow =
            'accelerometer; gyroscope; magnetometer; payment; camera; microphone'
          iframe.setAttribute('data-rzp-patched', 'true')
        }
      })
    }

    // Watch for Razorpay iframes being injected
    razorpayObserverRef.current = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length) patchRazorpayIframes()
      }
    })
    razorpayObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      // Disconnect observer
      razorpayObserverRef.current?.disconnect()
      razorpayObserverRef.current = null

      // Remove Razorpay SDK artifacts to stop background noise
      document.querySelectorAll(
        'iframe[src*="razorpay.com"], iframe[src*="sardine.ai"], .razorpay-container, .razorpay-backdrop'
      ).forEach((el) => el.remove())
    }
  }, [])

  // Create a hidden Html5Qrcode instance for frame-by-frame decode
  useEffect(() => {
    // Create a hidden container for html5-qrcode (it needs a DOM element)
    let hiddenDiv = document.getElementById('qr-hidden-scanner')
    if (!hiddenDiv) {
      hiddenDiv = document.createElement('div')
      hiddenDiv.id = 'qr-hidden-scanner'
      hiddenDiv.style.display = 'none'
      document.body.appendChild(hiddenDiv)
    }
    html5QrcodeRef.current = new Html5Qrcode('qr-hidden-scanner')
    html5QrcodeRefGlobal.current = html5QrcodeRef.current
    return () => {
      if (html5QrcodeRef.current) {
        try { html5QrcodeRef.current.clear() } catch {}
      }
      html5QrcodeRefGlobal.current = null
      hiddenDiv?.remove()
    }
  }, [])

  // Start camera + scanning on mount
  useEffect(() => {
    if (paymentStep === 'scanning') {
      startCamera()
    }
    return () => stopCamera()
  }, [paymentStep])

  const startCamera = useCallback(async () => {
    if (cameraStartingRef.current) return
    if (streamRef.current && videoRef.current?.srcObject) {
      return
    }

    cameraStartingRef.current = true
    const startSeq = ++cameraStartSeqRef.current
    setScanError(null)
    isProcessingRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      setCameraPermission('granted')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        const playPromise = videoRef.current.play()
        if (playPromise) {
          await playPromise.catch((error: any) => {
            if (error?.name === 'AbortError' && startSeq !== cameraStartSeqRef.current) {
              return
            }
            throw error
          })
        }
        if (startSeq !== cameraStartSeqRef.current) return
        setScannerActive(true)
        startScanningFrames()
      }
    } catch (err: any) {
      if (startSeq !== cameraStartSeqRef.current) return
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        setCameraPermission('denied')
        setScanError('Camera permission denied. Please allow camera access.')
      } else if (err.name === 'AbortError') {
        setScanError(null)
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setScanError('No camera found on this device.')
      } else {
        setScanError('Unable to access camera. Please try again.')
      }
    } finally {
      if (startSeq === cameraStartSeqRef.current) {
        cameraStartingRef.current = false
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    cameraStartSeqRef.current += 1
    cameraStartingRef.current = false
    // Stop scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScannerActive(false)
  }, [])

  /**
   * Capture video frames to a canvas and decode QR using html5-qrcode's scanFile.
   * This gives us full control over the video element layout.
   */
  const startScanningFrames = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

    scanIntervalRef.current = window.setInterval(async () => {
      if (isProcessingRef.current) return
      if (!videoRef.current || !canvasRef.current || !html5QrcodeRef.current) return
      if (videoRef.current.readyState < 2) return // not enough data yet

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Size canvas to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        // Convert canvas to blob and scan
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.8)
        })
        if (!blob) return

        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
        const result = await html5QrcodeRef.current!.scanFile(file, false)

        if (result && !isProcessingRef.current) {
          isProcessingRef.current = true
          handleScanResult(result)
        }
      } catch {
        // No QR code in this frame — ignore
      }
    }, 250) // Scan ~4 frames/second
  }, [])

  const handleScanResult = useCallback((decodedText: string) => {
    // Vibrate for haptic feedback
    if (navigator.vibrate) navigator.vibrate(100)

    stopCamera()

    const parsed = parseQrScanPayload(decodedText)

    if (parsed) {
      setScannedData(parsed)
      setValue('merchant', parsed.merchantName)
      if (parsed.kind === 'upi' && parsed.upi?.am) setValue('amount', parsed.upi.am)
      if (parsed.kind === 'upi' && parsed.upi?.tn) setValue('description', parsed.upi.tn)
      setPaymentStep('details')
      toast.success('QR Code scanned successfully!', { icon: '✅' })
    } else {
      toast.error('Not a valid UPI QR code. Please try again.', { icon: '❌' })
      setTimeout(() => {
        isProcessingRef.current = false
        startCamera()
      }, 1500)
    }
  }, [stopCamera, setValue, startCamera])

  // Handle gallery image upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadProcessing(true)
      setScanError(null)
      stopCamera()
      isProcessingRef.current = true

      const image = await fileToImageBitmap(file)
      if (isLikelyBlurry(image)) {
        setScanError('QR Code is unclear. Please upload a clearer image.')
        return
      }

      const result = await decodeQrImageFile(file)
      handleScanResult(result)
    } catch (error: any) {
      const message = error?.message || ''
      if (message.includes('clearer image')) {
        setScanError('QR Code is unclear. Please upload a clearer image.')
      } else if (message.includes('Unable to read this QR')) {
        setScanError('Unable to read this QR. Please try another image.')
      } else {
        setScanError('No QR Code Detected')
      }
      toast.error('Could not read QR code from image. Try again.')
      isProcessingRef.current = false
      if (paymentStep === 'scanning' && !streamRef.current) {
        startCamera()
      }
    } finally {
      setIsUploadProcessing(false)
    }
    // Reset file input so the same file can be selected again
    e.target.value = ''
  }, [stopCamera, handleScanResult, startCamera, paymentStep])

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      paymentApi.createOrder({
        amount: parseFloat(data.amount),
        merchant: data.merchant,
        description: data.description,
        notes: buildMetadataNotes(data.merchant, scannedData?.upiId || scannedData?.upi?.pa),
      }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        openRazorpayCheckout(response.data)
      } else {
        toast.error(response.message || 'Failed to create order')
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create payment order')
    },
  })

  // Verify payment mutation
  const verifyMutation = useMutation({
    mutationFn: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      paymentApi.verifyPayment(data),
    onSuccess: (response) => {
      if (response.success) {
        setPaymentResult(response.data)
        setPaymentStep('success')
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['payment-history'] })
        queryClient.invalidateQueries({ queryKey: ['payment-summary'] })
        queryClient.invalidateQueries({ queryKey: ['budget-progress'] })
        queryClient.invalidateQueries({ queryKey: ['smart-insights'] })
        toast.success('Payment successful! Expense auto-recorded 🎉')
      } else {
        setPaymentStep('failed')
        toast.error(response.message || 'Payment verification failed')
      }
    },
    onError: () => {
      setPaymentStep('failed')
      toast.error('Payment verification failed')
    },
  })

  const openRazorpayCheckout = (orderData: any) => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh.')
      return
    }
    const metadataNotes = buildMetadataNotes(orderData.merchant || scannedData?.merchantName || '', scannedData?.upiId || scannedData?.upi?.pa)
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'FinPal',
      description: `Payment to ${scannedData?.merchantName || orderData.merchant}`,
      order_id: orderData.orderId,
      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
        contact: user?.phone || '',
        ...(scannedData?.upiId ? { vpa: scannedData.upiId } : {}),
      },
      handler: function (response: any) {
        setPaymentStep('processing')
        verifyMutation.mutate({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
      },
      notes: {
        merchant: scannedData?.merchantName || orderData.merchant || '',
        upiVpa: scannedData?.upiId || scannedData?.upi?.pa || '',
        ...(metadataNotes || {}),
      },
      theme: { color: '#4f46e5' },
      modal: {
        ondismiss: () => toast('Payment cancelled', { icon: 'ℹ️' }),
        confirm_close: true,
        escape: true,
      },
      config: {
        display: {
          // Suppress Sardine biometric data collection which causes console noise
          hide: [{ method: 'emandate' }],
        },
      },
      method: { upi: true, card: true, netbanking: true, wallet: true },
    }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response: any) => {
      setPaymentStep('failed')
      toast.error(response.error?.description || 'Payment failed')
    })
    rzp.open()
  }

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await loadRazorpayScript()
    } catch {
      toast.error('Failed to load payment gateway. Check your internet connection.')
      return
    }
    createOrderMutation.mutate(data)
  }

  const resetScanner = () => {
    setScannedData(null)
    setPaymentResult(null)
    setPaymentStep('scanning')
    reset()
    isProcessingRef.current = false
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black flex flex-col">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ========== HEADER ========== */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-10 pb-3">
        <button
          onClick={() => { stopCamera(); navigate(-1) }}
          className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="text-white font-semibold text-lg">Scan & Pay</h1>
        <div className="w-10" />
      </div>

      {/* ========== SCANNING VIEW ========== */}
      {paymentStep === 'scanning' && (
        <div className="flex-1 flex flex-col">
          {isUploadProcessing && (
            <div className="absolute inset-x-0 top-0 z-30 flex justify-center pt-24 pointer-events-none">
              <div className="flex items-center gap-3 rounded-full bg-black/75 px-4 py-2 text-white shadow-lg backdrop-blur-sm">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Decoding QR image...</span>
              </div>
            </div>
          )}

          {/* Scanner Area */}
          <div className="flex-1 relative overflow-hidden bg-black">
            {/* Full-screen video feed */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {/* Custom scanning overlay */}
            {scannerActive && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                {/* Dimmed edges around scan area */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-black/50" />
                  <div
                    className="absolute bg-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '260px',
                      height: '260px',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                      borderRadius: '16px',
                    }}
                  />
                </div>

                {/* Corner brackets */}
                <div className="w-[260px] h-[260px] relative">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-white rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-white rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-white rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-white rounded-br-2xl" />

                  {/* Scanning laser line */}
                  <motion.div
                    className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full"
                    animate={{ top: ['8%', '92%', '8%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}

            {/* Camera permission denied */}
            {cameraPermission === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 p-6">
                <CameraOff size={48} className="text-gray-400 mb-4" />
                <h2 className="text-white text-lg font-semibold mb-2">Camera Access Required</h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                  Please allow camera access in your browser settings to scan QR codes.
                </p>
                <button
                  onClick={() => { setCameraPermission('prompt'); startCamera() }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Error state */}
            {scanError && cameraPermission !== 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 p-6">
                <AlertTriangle size={48} className="text-amber-400 mb-4" />
                <p className="text-gray-300 text-sm text-center mb-4">{scanError}</p>
                <button
                  onClick={() => startCamera()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="relative z-10 px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent -mt-16">
            <p className="text-gray-300 text-sm text-center mb-5">
              Choose how you want to scan the QR
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (paymentStep === 'scanning' && !scannerActive) startCamera()
                  else if (scannerActive) toast('Camera scanning is already active', { icon: '📷' })
                }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-white transition active:scale-[0.98] hover:bg-white/15"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Camera size={21} className="text-white" />
                </div>
                <span className="text-xs font-medium">Scan using Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-white transition active:scale-[0.98] hover:bg-white/15"
              >
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Image size={21} className="text-white" />
                </div>
                <span className="text-xs font-medium">Upload QR Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== PAYMENT DETAILS VIEW ========== */}
      {paymentStep === 'details' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-t-3xl mt-2 p-5 overflow-y-auto"
        >
          {/* Scanned merchant info */}
          {scannedData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-200"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${scannedData.verified ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <QrCode size={24} className={scannedData.verified ? 'text-green-600' : 'text-blue-600'} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-base">{scannedData.merchantName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${scannedData.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <CheckCircle size={11} />
                        {scannedData.verified ? 'Verified Merchant' : 'Standard Merchant'}
                      </span>
                      {scannedData.kind === 'structured' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700">
                          Structured QR
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700">
                          UPI QR fallback
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {scannedData.merchantId && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Merchant ID</p>
                    <p className="font-medium text-gray-800 break-all">{scannedData.merchantId}</p>
                  </div>
                )}
                {scannedData.category && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Category</p>
                    <p className="font-medium text-gray-800">{scannedData.category}</p>
                  </div>
                )}
                {scannedData.subcategory && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Sub Category</p>
                    <p className="font-medium text-gray-800">{scannedData.subcategory}</p>
                  </div>
                )}
                {scannedData.city && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">City</p>
                    <p className="font-medium text-gray-800">{scannedData.city}</p>
                  </div>
                )}
                {scannedData.state && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">State</p>
                    <p className="font-medium text-gray-800">{scannedData.state}</p>
                  </div>
                )}
                {scannedData.upiId && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200 col-span-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">UPI ID</p>
                    <p className="font-medium text-gray-800 break-all">{scannedData.upiId}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Amount */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                <Zap size={12} /> Amount
              </label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-2xl font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0"
                  className="text-3xl font-bold text-gray-800 bg-transparent border-none outline-none w-full placeholder-gray-300"
                  autoFocus={!(scannedData?.kind === 'upi' && scannedData.upi?.am)}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 1, message: 'Minimum ₹1' },
                  })}
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>

            {/* Merchant */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                <Store size={12} /> Paying To
              </label>
              <input
                type="text"
                placeholder="e.g., Swiggy, Amazon, Rent"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                {...register('merchant', {
                  required: 'Merchant name is required',
                  maxLength: { value: 200, message: 'Too long' },
                })}
              />
              {errors.merchant && <p className="text-red-500 text-xs mt-1">{errors.merchant.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Monthly grocery"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                {...register('description', { maxLength: { value: 500, message: 'Too long' } })}
              />
            </div>

            {/* UPI ID from QR */}
            {scannedData?.upiId && (
              <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">Paying to: {scannedData.upiId}</span>
              </div>
            )}

            {/* AI Auto-categorize badge */}
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Use QR metadata first, AI fallback only when needed</span>
              <div className="ml-auto w-8 h-5 bg-blue-600 rounded-full flex items-center justify-end px-0.5">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl text-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
              >
                {createOrderMutation.isPending ? (
                  <><Loader2 size={20} className="animate-spin" />Processing...</>
                ) : (
                  <><Smartphone size={20} />Continue</>
                )}
              </button>

              <button
                type="button"
                onClick={resetScanner}
                className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition active:scale-[0.98]"
              >
                <Camera size={16} />
                Scan Another QR
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-400">Powered securely by Razorpay</p>
          </form>
        </motion.div>
      )}

      {/* ========== PROCESSING VIEW ========== */}
      {paymentStep === 'processing' && (
        <div className="flex-1 flex items-center justify-center bg-white rounded-t-3xl mt-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
            <Loader2 size={48} className="animate-spin mx-auto text-blue-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment...</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your transaction</p>
          </motion.div>
        </div>
      )}

      {/* ========== SUCCESS VIEW ========== */}
      {paymentStep === 'success' && (
        <div className="flex-1 bg-white rounded-t-3xl mt-2 p-5 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle size={40} className="text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Successful! 🎉</h2>
            <p className="text-gray-500 text-sm">Expense auto-recorded using QR merchant metadata</p>

            {paymentResult && (
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mx-auto max-w-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 text-sm">Amount</span>
                  <span className="font-bold">₹{paymentResult.amount?.toLocaleString('en-IN')}</span>
                </div>
                {scannedData?.merchantName && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500 text-sm">Merchant</span>
                    <span className="font-medium text-gray-700 text-right">{scannedData.merchantName}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 text-sm">Category</span>
                  <span className="font-medium text-blue-600 flex items-center gap-1 text-right">
                    <Sparkles size={12} />{paymentResult.category}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 text-sm">Payment ID</span>
                  <span className="text-xs text-gray-400 font-mono text-right">{paymentResult.paymentId?.slice(0, 16)}...</span>
                </div>
              </div>
            )}

            {paymentResult?.budgetAlert && (
              <div className={`rounded-2xl p-4 text-left max-w-xs mx-auto ${paymentResult.budgetAlert.type === 'exceeded' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{paymentResult.budgetAlert.message}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 max-w-xs mx-auto">
              <button
                onClick={resetScanner}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 active:scale-95 transition"
              >
                Scan Again
              </button>
              <button
                onClick={() => navigate('/pay')}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 active:scale-95 transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========== FAILED VIEW ========== */}
      {paymentStep === 'failed' && (
        <div className="flex-1 bg-white rounded-t-3xl mt-2 p-5 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={40} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Payment Failed</h2>
            <p className="text-gray-500 text-sm">No amount was deducted. Please try again.</p>
            <div className="flex gap-3 max-w-xs mx-auto">
              <button
                onClick={resetScanner}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 active:scale-95 transition"
              >
                Scan Again
              </button>
              <button
                onClick={() => setPaymentStep('details')}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 active:scale-95 transition"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ScanPayPage
