import React from "react";
import HeaderFooterContent from "../../Components/FooterHeaderContent";
import MinimizeFunction from "../../Components/synthesis/MinimizeFunction"

const Tabulation = ()=>{
    return(
        <HeaderFooterContent useMinWidth = {true} useHeight = {false} useFooter = {true} content = {<MinimizeFunction useTabulaion = {true} />} />
        
    )
}

export default Tabulation;