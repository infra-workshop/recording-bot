import {BlockState} from "./BlockState";

export interface BlockParser {
    (state: BlockState): boolean
}
