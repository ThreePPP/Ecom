import { useState, useEffect } from 'react'
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import { addressAPI } from '@/app/lib/api'
import { useToast } from '../Toast/Toast'

interface Address {
    _id?: string
    fullName: string
    phoneNumber: string
    address: string
    province: string
    district: string
    subdistrict?: string
    postalCode: string
    isDefault?: boolean
}

interface AddressModalProps {
    isOpen: boolean
    onClose: () => void
    addressToEdit?: Address | null
    onSuccess: () => void
}

export default function AddressModal({ isOpen, onClose, addressToEdit, onSuccess }: AddressModalProps) {
    const { showSuccessToast, showErrorToast } = useToast()
    const [formData, setFormData] = useState<Address>({
        fullName: '',
        phoneNumber: '',
        address: '',
        province: '',
        district: '',
        subdistrict: '',
        postalCode: '',
        isDefault: false,
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (addressToEdit) {
                setFormData({
                    fullName: addressToEdit.fullName || '',
                    phoneNumber: addressToEdit.phoneNumber || '',
                    address: addressToEdit.address || '',
                    province: addressToEdit.province || '',
                    district: addressToEdit.district || '',
                    subdistrict: addressToEdit.subdistrict || '',
                    postalCode: addressToEdit.postalCode || '',
                    isDefault: addressToEdit.isDefault || false,
                })
            } else {
                setFormData({
                    fullName: '',
                    phoneNumber: '',
                    address: '',
                    province: '',
                    district: '',
                    subdistrict: '',
                    postalCode: '',
                    isDefault: false,
                })
            }
        }
    }, [addressToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (addressToEdit && addressToEdit._id) {
                await addressAPI.updateAddress(addressToEdit._id, formData)
            } else {
                await addressAPI.addAddress(formData)
            }
            onSuccess()
            onClose()
            showSuccessToast('บันทึกที่อยู่เรียบร้อยแล้ว')
        } catch (error) {
            console.error('Error saving address:', error)
            showErrorToast('เกิดข้อผิดพลาดในการบันทึกที่อยู่')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (field: keyof Address, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        {addressToEdit ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                                placeholder="ชื่อ-สกุล ผู้รับ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                                placeholder="08xxxxxxxx"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                        <textarea
                            required
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                            placeholder="บ้านเลขที่, หมู่, ซอย, ถนน"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
                            <input
                                type="text"
                                required
                                value={formData.province}
                                onChange={(e) => handleChange('province', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">อำเภอ/เขต</label>
                            <input
                                type="text"
                                required
                                value={formData.district}
                                onChange={(e) => handleChange('district', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ตำบล/แขวง</label>
                            <input
                                type="text"
                                value={formData.subdistrict || ''}
                                onChange={(e) => handleChange('subdistrict', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
                            <input
                                type="text"
                                required
                                value={formData.postalCode}
                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm text-black"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={(e) => handleChange('isDefault', e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="isDefault" className="text-sm text-gray-700">ตั้งเป็นที่อยู่เริ่มต้น</label>
                    </div>

                    <div className="mt-8 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? 'กำลับบันทึก...' : 'บันทึกที่อยู่'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
