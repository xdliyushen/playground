import { countBy, pathOr } from "ramda";

export const createEmptyArr = (row, column) => {
    const rowArr = new Array(row).fill(null);

    return rowArr.map(item => new Array(column).fill(false));
};

// 核心算法
export const lifeCore = (data) => {
    return data.map((row, rowIndex) => {
        return row.map((cell, columnIndex) => {
            const topLeft = pathOr(false, [rowIndex - 1, columnIndex - 1], data);
            const top = pathOr(false, [rowIndex - 1, columnIndex], data);
            const topRight = pathOr(false, [rowIndex - 1, columnIndex + 1], data);

            const left = pathOr(false, [rowIndex, columnIndex - 1], data);
            const right = pathOr(false, [rowIndex, columnIndex + 1], data);

            const bottomLeft = pathOr(false, [rowIndex + 1, columnIndex - 1], data);
            const bottom = pathOr(false, [rowIndex + 1, columnIndex], data);
            const bottomRight = pathOr(false, [rowIndex + 1, columnIndex + 1], data);

            const temp = [
                topLeft,
                top,
                topRight,
                left,
                right,
                bottomLeft,
                bottom,
                bottomRight,
            ];
            const liveCount = temp.reduce((prev, val) => val ? prev + 1 : prev);

            if(liveCount === 3) {
                return true;
            } else if(liveCount === 2) {
                return cell;
            }

            return false;
        });
    });


    return data;
};