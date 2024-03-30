import MetaHeader from '../../components/meta-header/MetaHeader'
import Navigation from '../../components/navigation/Navigation'
import TitleBox from '../../components/title-box/TitleBox'
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useSelector } from 'react-redux'


const GeneralProductDetail = () => {
    const { uuid } = useParams()
    const navigate = useNavigate()
    const isLogin = useSelector((state) => state.isLogin.isLogin)
    const [dataGeneral, setDataGeneral] = useState([])

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API}/read-general-product-uuid/${uuid}`)
            .then((response) => {
                if (response.data.status) {
                    setDataGeneral(response.data.payload[0])
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }, [uuid])

    const alertSuccess = (title, text, confirmButtonText) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'success',
            confirmButtonText: confirmButtonText
        })
            .then((result) => {
                if (result.isConfirmed) {
                    navigate('/transaction')
                }
            })
    }


    const handleBuyProduct = (event) => {
        if (!isLogin.status) {
            Swal.fire({
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'คุณยังไม่ได้เข้าสู่ระบบ',
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3FC3EE',

                cancelButtonColor: '#F27474',
                confirmButtonText: 'ตกลง, ไปหน้าเข้าสู่ระบบ',
                cancelButtonText: 'ยกเลิก'
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        navigate('/sign-in')
                    }
                })
        }
        else {
            Swal.fire({
                title: 'แจ้งเตือน',
                text: `คุณต้องการจ่าย ${dataGeneral.normal_price} Aysel สำหรับ ${dataGeneral.name}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3FC3EE',

                cancelButtonColor: '#F27474',
                confirmButtonText: 'ตกลง',
                cancelButtonText: 'ยกเลิก'
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        if (parseFloat(isLogin.payload.aysel_amount) >= parseFloat(dataGeneral.normal_price)) {
                            axios.patch(`${process.env.REACT_APP_API}/update-aysel`, {
                                email: isLogin.payload.email,
                                aysel_amount: parseFloat(isLogin.payload.aysel_amount) - parseFloat(dataGeneral.normal_price)
                            }, { withCredentials: true })
                                .then((response) => {
                                    if (response.data.status) {
                                        //    alertSuccess('สำเร็จ','การซื้อสำเร็จ','ตกลง')
                                    } else {
                                        alertSuccess('ไม่สำเร็จ', 'การซื้อไม่สำเร็จ', 'ตกลง')
                                    }
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                            axios.post(`${process.env.REACT_APP_API}/create-store-product`, {
                                email: isLogin.payload.email,
                                method_uuid: dataGeneral.uuid,
                                game_name: dataGeneral.game_name,
                                product_name: dataGeneral.name,
                                used_status: 0
                            }, { withCredentials: true })
                                .then((response) => {
                                    if (response.data.status) {
                                        // console.log("สร้างสินค้าในคลังสำเร็จ")
                                        axios.get(`${process.env.REACT_APP_API}/read-lasted-store-product`, { withCredentials: true })
                                            .then((response) => {
                                                if (response.data.status) {
                                                    axios.post(`${process.env.REACT_APP_API}/create-history-product`, {
                                                        uuid: response.data.payload[0].uuid,
                                                        email: isLogin.payload.email,
                                                        game_name: dataGeneral.game_name,
                                                        product_name: dataGeneral.name,
                                                        product_price: dataGeneral.normal_price,
                                                        buy_method: "สินค้าทั่วไป"
                                                    }, { withCredentials: true })
                                                        .then((response) => {
                                                            if (response.data.status) {
                                                                navigate('/transaction')
                                                            } else {
                                                                // console.log("Error")
                                                            }
                                                        })
                                                        .catch((error) => {
                                                            console.log(error)
                                                        })
                                                }
                                            })
                                            .catch((error) => {
                                                console.log(error)
                                            })
                                    } else {
                                        console.log("สร้างสินค้าในไม่คลังสำเร็จ")
                                    }
                                })
                                .catch((error) => {
                                    console.log(error)
                                })
                        }
                        else if (parseFloat(isLogin.payload.aysel_amount) < parseFloat(dataGeneral.normal_price)) {
                            Swal.fire({
                                title: 'ผิดพลาด',
                                text: `จำนวนAyselไม่เพียงพอต่อการซื้อ`,
                                icon: 'error',
                                showCancelButton: true,
                                confirmButtonColor: '#3FC3EE',

                                cancelButtonColor: '#F27474',
                                confirmButtonText: 'ตกลง, ไปเติมAysel',
                                cancelButtonText: 'ยกเลิก'
                            })
                                .then((result) => {
                                    if (result.isConfirmed) {
                                        navigate('/top-up')
                                    }
                                })
                        }
                    }
                })
        }
    }
    return (
        <div>
            <MetaHeader title={`สินค้า - ${dataGeneral.name}`} />
            <Navigation />
            <TitleBox title={dataGeneral.name} />
            <div className='flex items-center justify-center md:grid-cols-2 lg:w-full sm:grid-cols-1'>
                <div className="flex-row border shadow-xl lg:w-[740px] h-[280px] border-x-4 border-y-4 border-shadow-primary card lg:card-compact bg-base-100">
                    <div className="flex w-[245px] ">
                        <figure className="flex mx-auto my-auto border rounded-lg border-shadow-primary border-x-4 border-y-4">
                            <div className='flex w-[200px] h-[180px] '>
                                <img src={`${process.env.REACT_APP_GENERAL_PRODUCT}${dataGeneral.information}`} alt='product' className='flex w-full h-full' />
                            </div>
                        </figure>
                    </div>
                    <div className="card-body ">
                        <div className="flex-col justify-center pt-5 ">
                            <div className="flex justify-center">
                                <div className="text-3xl card-title">{dataGeneral.name}</div>
                            </div>
                            <div className="flex justify-center">
                                <div className="text-2xl card-title">{`( ${dataGeneral.game_name} )`}</div>
                            </div>
                            <div className="flex justify-center pt-5 pb-10">
                                <span className="flex text-xl">{`${dataGeneral.normal_price} Aysel`}</span>
                            </div>
                        </div>
                        <div className="flex justify-end card-action ">
                            <button className="btn" onClick={() => document.getElementById('detail-product').showModal()}>ดูรายละเอียด</button>
                        </div>
                        <dialog id='detail-product' className='modal'>
                            <div className='flex flex-col justify-center modal-box border-x-4 border-y-4 border-shadow-info'>
                                <div className='flex justify-center '>
                                    <div className='flex border-x-8 border-y-8 rounded-xl border-shadow-primary w-[200px] h-[180px] justify-center bg-'>
                                        <img src={`${process.env.REACT_APP_GENERAL_PRODUCT}${dataGeneral.information}`} alt='payment-method' className='' />
                                    </div>
                                </div>
                                <div className='flex justify-center px-12 my-5'>
                                    <div className='flex justify-center '>
                                        <div className='text-xl text-shadow-info'>{dataGeneral.description}  </div>
                                    </div>
                                </div>
                                <div className="flex justify-center modal-action">
                                    <form method='dialog'>
                                        <button className="btn bg-shadow-info hover:bg-shadow-hinfo text-shadow-white " >ตกลง</button>
                                    </form>
                                </div>
                            </div>
                        </dialog>

                    </div>
                </div>
            </div>
            <div className='flex w-full h-full mb-10'>
                <div className='flex flex-col w-full h-full my-5 px-[25rem]  items-end'>
                    <div className='flex gap-2 my-2+'>
                        <span className='text-3xl text-shadow-primary '>{dataGeneral.normal_price}</span>
                        <span className='text-3xl font-semibold text-shadow-primary'>{ }</span>
                        <Icon icon={"game-icons:minerals"} className="text-3xl size-fit text-shadow-info sm:text-4xl" />
                    </div>
                    <div className='flex my-2'>
                        <div className='w-36 btn bg-shadow-white border-shadow-accent text-shadow-accent hover:bg-shadow-haccent hover:text-shadow-white' onClick={handleBuyProduct}>สั่งซื้อ</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default GeneralProductDetail