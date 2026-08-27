
export function watermarkGravity( gravity: String){
    switch (gravity) {
        case 'top-left':
            return "northwest"
        case 'top-center':
            return "north"
        case 'top-right':
            return "northeast"
        case 'left':
            return "west"
        case 'center':
            return "center"
        case 'right':
            return "east"
        case 'bottom-left':
            return "southwest"
        case 'bottom-right':
            return "southeast"
        case 'bottom-center':
            return "south"
        default:
            return "southeast"
    }
}