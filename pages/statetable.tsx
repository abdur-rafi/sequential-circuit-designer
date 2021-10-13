import HeaderFooterContent from "../Components/FooterHeaderContent";
import StateTableInput from "../Components/state-table/StateTableInput";

function S(){
    return(
        <HeaderFooterContent useHeight = {false} content = {<StateTableInput />} useFooter = {true} />
    )
}

export default S;