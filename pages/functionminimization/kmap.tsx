import React from 'react'
import HeaderFooterContent from '../../Components/FooterHeaderContent';
import Header from '../../Components/Header';
import MinimizeFunction from '../../Components/synthesis/MinimizeFunction'

const MinimizeUsingKMap : React.FC<{

}> = (props)=>{
    return(
        <HeaderFooterContent useHeight = {false} useFooter = {true} content = {<MinimizeFunction />} />
    )
}

export default MinimizeUsingKMap;