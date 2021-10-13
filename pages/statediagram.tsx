
import HeaderFooterContent from "../Components/FooterHeaderContent";
import Canvas from "../Components/state-diagram/Canvas";

function StateDiagram(){
    return(
        <HeaderFooterContent useFooter = {false} content = {<Canvas />} />
    )
}

export default StateDiagram;