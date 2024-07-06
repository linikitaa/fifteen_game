document.addEventListener("DOMContentLoaded", () => {
    const containerNode = document.getElementById("fifteen");
    const gameNode = document.getElementById("game");
    const countItems = 16;

    // Создаем и добавляем элементы в контейнер
    const values = Array.from({length: 16}, (_, index) => index + 1);
    values.forEach(value => {
        const button = document.createElement("button");
        button.className = "item";
        button.setAttribute("data-matrix-id", value)
        // button.dataset.id = value
        const span = document.createElement("span");
        span.className = "border";
        span.textContent = value;
        button.appendChild(span);
        containerNode.appendChild(button);
    });

    // Проверка количества элементов
    const itemNodes = Array.from(containerNode.querySelectorAll(".item"));
    if (itemNodes.length !== countItems) {
        throw new Error(`Должно быть ровно ${countItems} items in HTML`);
    }

    // Позиционирование элементов

    itemNodes[countItems - 1].style.display = 'none'

    let matrix = getMatrix(itemNodes.map(item => Number(item.dataset.matrixId)))
    setPositionItems(matrix)

    //Перемешивание элементов
    // // Функция для перемешивания элементов (если необходимо)
    // const shuffleButton = document.getElementById("shuffleButton");
    // shuffleButton.addEventListener("click", () => {
    //     const shuffledValues = values.sort(() => Math.random() - 0.5);
    //     containerNode.innerHTML = '';
    //     shuffledValues.forEach(value => {
    //         const button = document.createElement("button");
    //         button.className = "item";
    //         const span = document.createElement("span");
    //         span.className = "border";
    //         span.textContent = value;
    //         button.appendChild(span);
    //         containerNode.appendChild(button);
    //     });
    // });

    // Shuffle

    //1 вариант ()
    // document.getElementById('shuffleButton').addEventListener('click', () => {
    //     const shuffledArray = shuffleArray(matrix.flat())
    //     matrix = getMatrix(shuffledArray)
    //     setPositionItems(matrix)
    // })

    // 2 вариант

    const maxShuffleCount = 50
    let timer
    let shuffledClass = 'gameShuffle'

    document.getElementById('shuffleButton').addEventListener('click', () => {
        let shuffleCount = 0
        clearInterval(timer)

        if (shuffleCount === 0) {
            timer = setInterval(() => {
                gameNode.classList.add(shuffledClass)
                randomSwap(matrix)
                setPositionItems(matrix)

                shuffleCount += 1

                if (shuffleCount >= maxShuffleCount) {
                    gameNode.classList.remove(shuffledClass)

                    clearInterval(timer)
                }
            }, 70)
        }
    })


    // Change Position

    const blankNumber = 16
    containerNode.addEventListener('click', (event) => {
        const buttonNode = event.target.closest('button')
        if (!buttonNode) {
            return
        }

        const buttonNumber = Number(buttonNode.dataset.matrixId)
        const buttonCoords = findCoordinatesByNumber(buttonNumber, matrix)
        const blankCoords = findCoordinatesByNumber(blankNumber, matrix)
        const isValid = isValidForSwap(buttonCoords, blankCoords)
        if (isValid) {
            swap(blankCoords, buttonCoords, matrix)
            setPositionItems(matrix)
        }
    })

    // Перемещение элемента by arrows

    window.addEventListener('keydown', (event) => {
        if (!event.key.includes('Arrow')) {
            return
        }
        const blankCoords = findCoordinatesByNumber(blankNumber, matrix)
        const buttonCoords = {
            x: blankCoords.x,
            y: blankCoords.y
        }

        const maxIndexMatrix = matrix.length
        const direction = event.key.split('Arrow')[1].toLowerCase()
        switch (direction) {
            case 'up':
                buttonCoords.y += 1
                break
            case 'down':
                buttonCoords.y -= 1
                break
            case 'left':
                buttonCoords.x += 1
                break
            case 'right':
                buttonCoords.x -= 1
                break
        }

        if (buttonCoords.y >= maxIndexMatrix || buttonCoords.y < 0 ||
            buttonCoords.x >= maxIndexMatrix || buttonCoords.x < 0) {
            return;
        }
        swap(blankCoords, buttonCoords, matrix)
        setPositionItems(matrix)
    })


    /**
     *
     * Helpers
     *
     */

    let blockedCoords = null
    function randomSwap() {
        const blankCoords = findCoordinatesByNumber(blankNumber, matrix)
        const validCoords = findValidCoords({
            blankCoords,
            matrix,
            blockedCoords
        })

        const swapCoords = validCoords[
            Math.floor(Math.random() * validCoords.length)
            ]

        swap(blankCoords, swapCoords, matrix)
        blockedCoords = blankCoords
    }

    function findValidCoords({blankCoords, matrix}) {
        const validCoords = []

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (isValidForSwap({x, y}, blankCoords)) {
                    if (!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)) {
                        validCoords.push({x, y})
                    }
                }
            }
        }

        return validCoords
    }

    function getMatrix(arr) {
        const matrix
            = [[], [], [], []]

        let y = 0
        let x = 0

        for (let i = 0; i < arr.length; i++) {
            if (x >= 4) {
                y++
                x = 0
            }
            matrix[y][x] = arr[i]
            x++
        }

        return matrix
    }

    function setPositionItems(matrix) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                const value = matrix[y][x]
                const node = itemNodes[value - 1]
                setNodeStyles(node, x, y)
            }
        }
    }

    function setNodeStyles(node, x, y) {
        const shiftPs = 100
        node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%,0)`
    }

    // shuffle 1 варианта
    // function shuffleArray(arr) {
    //     return arr
    //         .map(value => ({value, sort: Math.random()}))
    //         .sort((a, b) => a.sort - b.sort)
    //         .map(({value}) => value)
    // }

    function findCoordinatesByNumber(number, matrix) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === number) {
                    return {x, y}
                }
            }
        }

        return null
    }

    function isValidForSwap(coord1, coord2) {
        const diffX = Math.abs(coord1.x - coord2.x)
        const diffY = Math.abs(coord1.y - coord2.y)

        return (diffX === 1 || diffY === 1) && (coord1.x === coord2.x || coord1.y === coord2.y)
    }

    function swap(coords1, coords2, matrix) {
        const coord1Number = matrix[coords1.y][coords1.x]
        matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x]
        matrix[coords2.y][coords2.x] = coord1Number

        if (isWon(matrix)) {
            addWonClass()
        }
    }

    const winFlatArr = new Array(16).fill(0).map((_, i) => i + 1)

    function isWon(matrix) {
        const flatMatrix = matrix.flat()
        for (let i = 0; i < winFlatArr.length; i++) {
            if (flatMatrix[i] !== winFlatArr[i]) {
                return false
            }
        }

        return true
    }

    const wonClass = 'fifteenWon'

    function addWonClass() {
        setTimeout(() => {
            containerNode.classList.add(wonClass)

            setTimeout(() => {
                containerNode.classList.remove(wonClass)
            }, 1000)
        }, 200)
    }
});

