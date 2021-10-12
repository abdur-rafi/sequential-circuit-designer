import React from 'react'
import Header from '../../Components/Header';
import MinimizeFunction from '../../Components/synthesis/MinimizeFunction'

const MinimizeUsingKMap : React.FC<{

}> = (props)=>{
    return(
        <div>
            <Header />
            <div style={{
                marginTop : 80
            }}>
                <MinimizeFunction />
            </div>
        </div>
    )
}

export default MinimizeUsingKMap;