
export const defaultStateNodeConfig : defaultStateNodeConfig = {
    radius : 45,
    color : '#26734d',
    gap : 4,
    ioNodeDiameter : 10
}

export const defalutIONodeConfig : defalutIONodeConfig = {
    inNodeColor : '#00ff00',
    outNodeColor : '#cc6600'
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
    outNodeColor : string
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