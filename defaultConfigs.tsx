
export const defaultStateNodeConfig : defaultStateNodeConfig = {
    minRadius : 20,
    color : '#ffffff',
    gap : 6,
    ioNodeDiameter : 8,
    font : 'bold 20px serif',
    
}

export const defalutIONodeConfig : defalutIONodeConfig = {
    inNodeColor : '#00ff00',
    outNodeColor : '#cc6600',
    inputLabelGap : 8,
    font : 'bold 12px serif',
    fontSize : 12,
    inpCombLengthExtra : 12
}
export const canvasConfig : canvasConfig = {
    nodeCanvasLineWidth : 2,
    edgeCanvasLineWidth : 4,
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
    inpCombLengthExtra : number
}

interface defaultStateNodeConfig {
    minRadius : number,
    color : string,
    gap : number,
    ioNodeDiameter : number,
    font : string,
}
interface canvasConfig{
    nodeCanvasLineWidth : number,
    edgeCanvasLineWidth : number,
    tempCanvasLineWidth : number,

}