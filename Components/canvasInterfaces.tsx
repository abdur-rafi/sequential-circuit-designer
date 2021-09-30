export interface Point{
    x : number, 
    y : number
}


export interface StateNode{
    center : Point,
    radius : number,
    gap : number,
    ioNodes : IONode[],
    color : string

}
export interface IONode{
    center : Point,
    radius : number,
    originNode : StateNode,
    angle : number,
    type : 'in' | 'out',
    color : string,
    edges : Edge[]

}

export interface Edge{
    from : IONode,
    to : IONode,
    points : Point[],
    pointsSet : Set<string>,
    color : string
}