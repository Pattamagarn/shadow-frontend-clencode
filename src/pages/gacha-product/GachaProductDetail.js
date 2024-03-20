import MetaHeader from '../../components/meta-header/MetaHeader'
import Navigation from '../../components/navigation/Navigation'
import TitleBox from '../../components/title-box/TitleBox'
import Card from '../../components/card/Card'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'


const GachaProductDetail = () => {
    const { uuid } = useParams()
    const navigate = useNavigate()
    const isLogin = useSelector((state) => state.isLogin.isLogin)
    const [dataGacha,setDataGacha] = useState([])
    
    return (
        <div>
            <MetaHeader title={`สินค้า - sword`} />
            <Navigation />
            <TitleBox title={'sword'} />
            <div className='flex items-center justify-center md:grid-cols-2 lg:w-full sm:grid-cols-1'>
                <Card
                    detail={true}
                // name={value.name}
                // game_name={value.game_name}
                // aysel={value.normal_price}
                // information={value.information}
                // promotion_status={value.special_price_status}
                // promotion={value.special_price}
                // path='general'   
                />
            </div>
        </div>
    )
}

export default GachaProductDetail