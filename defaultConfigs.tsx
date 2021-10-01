
export const defaultStateNodeConfig : defaultStateNodeConfig = {
    radius : 45,
    color : 'cadetBLue',
    gap : 14
}

export const defalutIONodeConfig : defalutIONodeConfig = {
    inNodeColor : 'green',
    outNodeColor : 'brown'
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
    gap : number
}
interface canvasConfig{
    height : string,
    width : string
}