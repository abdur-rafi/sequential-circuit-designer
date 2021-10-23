import HeaderFooterContent from "../Components/FooterHeaderContent";
import StateTableInput from "../Components/state-table/StateTableInput";

function S(){
    return(
        <HeaderFooterContent useMinWidth = {true} useHeight = {false} content = {<StateTableInput />} useFooter = {true} />
    )
}

export default S;