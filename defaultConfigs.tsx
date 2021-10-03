
export const defaultStateNodeConfig : defaultStateNodeConfig = {
    radius : 30,
    color : '#ffffff',
    gap : 4,
    ioNodeDiameter : 8,
}

export const defalutIONodeConfig : defalutIONodeConfig = {
    inNodeColor : '#00ff00',
    outNodeColor : '#cc6600',
    inputLabelGap : 8,
    inputLabelSize : 10
}
export const canvasConfig : canvasConfig = {
    height : '90vh',
    width : '700px'
}

interface colorConfig{
    inNode : string,
    outNode : string
}

interface defalutIONodeConfig{
    inNodeColor : string,
    outNodeColor : string,
    inputLabelGap : number,
    inputLabelSize : number
}

interface defaultStateNodeConfig {
    radius : number,
    color : string,
    gap : number,
    ioNodeDiameter : number
}
interface canvasConfig{
    height : string,
    width : string
}