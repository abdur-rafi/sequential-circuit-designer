
export const defaultStateNodeConfig : defaultStateNodeConfig = {
    minRadius : 22,
    color : '#ffffff',
    gap : 8,
    ioNodeDiameter : 12,
    font : 'bold 20px serif',
    fontSize : 20
    
}

export const defalutIONodeConfig : defalutIONodeConfig = {
    inNodeColor : '#00ff00',
    outNodeColor : '#cc6600',
    inputLabelGap : 8,
    font : 'bold 12px serif',
    fontSize : 12,
    inpCombLengthExtra : 12,
    focusGap : 6
}
export const canvasConfig : canvasConfig = {
    nodeCanvasLineWidth : 2,
    edgeCanvasLineWidth : 3,
    tempCanvasLineWidth : 1,
}

interface colorConfig{
    inNode : string,
    outNode : string
}

interface defalutIONodeConfig{
    inNodeColor : string,
    outNodeColor : string,
    inputLabelGap : number,
    font : string,
    fontSize : number,
    inpCombLengthExtra : number,
    focusGap : number
}

interface defaultStateNodeConfig {
    minRadius : number,
    color : string,
    gap : number,
    ioNodeDiameter : number,
    font : string,
    fontSize : number
}
interface canvasConfig{
    nodeCanvasLineWidth : number,
    edgeCanvasLineWidth : number,
    tempCanvasLineWidth : number,

}