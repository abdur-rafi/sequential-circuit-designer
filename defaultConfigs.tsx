
export const defaultStateNodeConfig : defaultStateNodeConfig = {
    radius : 40,
    color : 'cadetBLue',
    gap : 12
}

export const defalutIONodeConfig : defalutIONodeConfig = {
    inNodeColor : 'green',
    outNodeColor : 'brown'
}
export const canvasConfig : canvasConfig = {
    height : '800px',
    width : '800px'
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