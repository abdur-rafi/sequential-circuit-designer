export interface Point{
    x : number, 
    y : number
}


export interface StateNode{
    center : Point,
    radius : number,
    gap : number,
    ioNodeDiameter : number,
    ioNodes : IONode[],
    color : string,
    label : string,
    inputCombTextLength : number,
    minRadius : number

}
export interface IONode{
    center : Point,
    radius : number,
    originNode : StateNode,
    angle : number,
    type : 'in' | 'out',
    color : string,
    edges : Edge[]
    inputComb : string,
    output : string
}

export interface Edge{
    from : IONode,
    to : IONode,
    points : Point[],
    pointsSet : Set<string>,
    color : string
}
export type MouseMode = 'addNode' | 'drag' | 'edge' | 'select';