/*
Fecha de entrega: 1 nov 2023, 9:00
Desarrollar un agente que juegue cuadrito. Tiene límite de tiempo:
1. Aquí encuentran el código del ambiente
2. Su agente debe heredar de la clase Agent y debe sobreescribir el método compute
3. El método de iniciar el agente recibe tres argumentos: 
- El color con que está jugando
- El tablero inicial del cual puede obtener el tamaño (siempre cuadrado)
- El tiempo total de juego en milisegundos
4. El método compute recibe dos argumentos:
- El tablero como va 
- El tiempo que le queda a su agente en milisegundos
5. El método compute debe retornar una lista con tres argumentos [fila, columna, lado]. El valor del lado
es un número 0: arriba, 1: derecha, 2.abajo, 3:izquierda 
*/

// Konekti

/**
* Abstarct agent class
*/
interface IPlayerMap {
    [key: string]: Agent;
}

class Agent{
    public color: string;
    public time: number;
    public size: number;
    
    /**
    * Creates an agent
    */
    constructor(){
        this.color = ''
        this.time = 0
        this.size = 0
    }
    
    /**
    * Initializes the agent
    * @param color Color of the agent pieces ('R':red or 'Y':yellow)
    * @param board Initial state of the board (empty, useful for obtaaining the size (nxn))
    * @param time Total amount of time the agent has for playing all the game (milliseconds)
    */
    init(color: string, board: Array<Array<number>>, time: number=20000){
        this.color = color
        this.time = time
        this.size = board.length
    }
    
    /**
    * Determines the next play of the agent
    * @param board Current square configuration
    * @param time Remaining time the agent has for playing all the game (milliseconds)
    * @return A list with three values [row, column, side]. Parameter size can take one of the following values: 
    0 is up, 1 is right, 2 is bottom, 3 is left  
    */
    compute( board : Array<Array<number>>, time : number ){
        return [0,0,0] as [number, number, number];
    }
}

/*
* A class for board operations (it is not the board but a set of operations over it)
*/
class Board{
    constructor(){}
    
    // Initializes a board of the given size. A board is a matrix of size*size of integers 0, .., 15, -1, or -2
    init(size : number){
        const m = size-1
        const board : Array<Array<number>> = []
        board[0] = []
        board[0][0] = 9
        for(let j=1; j<m; j++){
            board[0][j] = 1
        }
        board[0][m] = 3
        
        for(let i=1; i<m; i++){
            board[i] = []
            board[i][0] = 8
            for(let j=1; j<m; j++){
                board[i][j] = 0
            }
            board[i][m] = 2
        }
        
        board[m] = []
        board[m][0] = 12
        for(let j=1; j<m; j++){
            board[m][j] = 4
        }
        board[m][m] = 6
        
        return board
    }
    
    // Deep clone of a board the reduce risk of damaging the real board
    clone(board : Array<Array<number>>){
        const size = board.length
        const b : Array<Array<number>> = []
        for(let i=0; i<size; i++){
            b[i] = []
            for(let j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }
    
    // Determines if a line can be drawn at row r, column c, side s 
    check(board : Array<Array<number>>, r: number, c: number, s: number){
        if(board[r][c] < 0) return false
        s = 1<<s
        return ((board[r][c] & s)!=s)
    }
    
    // Computes all the valid moves for the given 'color'
    valid_moves(board : Array<Array<number>>){
        const moves : Array<[number,number,number]> = []
        const size = board.length
        for( let i=0; i<size; i++)
            for( let j=0; j<size; j++)
                for( let s=0; s<4; s++)
                    if(this.check(board, i, j, s)) moves.push([i,j,s])
                        return moves
    }
    
    fill(board: Array<Array<number>>, i: number, j: number, color: any){
        if(i<0 || i==board.length || j<0 || j==board.length) return board
        
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                this.fill(board,i-1,j,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                this.fill(board,i,j+1,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                this.fill(board,i+1,j,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                this.fill(board,i,j-1,color)
            }    
        }
        return board
    }
    
    // Computes the new board when a piece of 'color' is set at row i, column j, side s. 
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board: Array<Array<number>>, i: number, j: number, s: number, color:any){
        if(this.check(board, i, j, s)){
            const ocolor = (color==-2)?-1:-2
            board[i][j] |= 1<<s
            board = this.fill(board, i, j, ocolor)
            if(i>0 && s==0){
                board[i-1][j] |= 4
                board = this.fill(board, i-1, j, ocolor)
            }
            if(i<board.length-1 && s==2){
	    	    if(board[i+1][j] >= 0) board[i+1][j] |= 1
    	        board = this.fill(board, i+1, j, ocolor)
    	    }
            if(j>0 && s==3){
                board[i][j-1] |= 2
                board = this.fill(board, i, j-1, ocolor)
            }
            
            if(j<board.length-1 && s==1){
                board[i][j+1] |= 8
                board = this.fill(board, i, j+1, ocolor)
            }
            return true 
        }
        return false
    }
    
    // Determines the winner of the game if available 'R': red, 'Y': yellow, ' ': none
    winner(board: Array<Array<number>>){
        let cr = 0
        let cy = 0
        for(let i=0; i<board.length; i++)
            for(let j=0; j<board.length; j++)
                if(board[i][j]<0){
            // TODO: This is just wrong
            if(board[i][j] == -1){ cr++ }else{ cy++ }
        }
        if(cr+cy<board.length*board.length) return ' '
        if(cr>cy) return 'R'
        if(cy>cr) return 'Y'
        return ' '
    }
    
    // Draw the board on the canvas
    print(board : Array<Array<number>>){
        interface Command {
            command: string
            y: number
            x: number
            commands: Array<{command: string}>
        }
        const size = board.length
        // Commands to be run (left as string to show them into the editor)
        const grid : Array<Command> = []
        for(let i=0; i<size; i++){
            for(let j=0; j<size; j++){
                const commands = [{"command":"-"}]
                if(board[i][j] < 0){
                    if(board[i][j]==-1) commands.push({"command":"R"})
                        else commands.push({"command":"Y"})
                    commands.push({"command":"u"})
                    commands.push({"command":"r"})
                    commands.push({"command":"d"})
                    commands.push({"command":"l"})
                }else{
                    if((board[i][j]&1)==1) commands.push({"command":"u"})
                        if((board[i][j]&2)==2) commands.push({"command":"r"})
                            if((board[i][j]&4)==4) commands.push({"command":"d"})
                                if((board[i][j]&8)==8) commands.push({"command":"l"})
                                }
                grid.push({"command":"translate", "y":i, "x":j, "commands":commands})
            }
        }
        
        const cmds = {"r":true,"x":1.0/size,"y":1.0/size,"command":"fit", "commands":grid}
        Konekti.client['canvas'].setText(cmds)
    }
}

/*
* Player's Code (Must inherit from Agent: It is mandatory the inheritance process) 
* This is an example of a rangom player agent
*
*/
class RandomPlayer extends Agent{
    public board: Board;
    public memory: number;
    
    constructor(color : string){
        super() 
        this.board = new Board()
        this.memory = 0
        this.color = color
    }
    
    compute(board : Array<Array<number>>, time : number){
        // Always cheks the current board status since opponent move can change several squares in the board
        const moves = this.board.valid_moves(board)
        // Randomly picks one available move
        const index = Math.floor(moves.length * Math.random())
        for(let i=0; i<50000000; i++){} // Making it very slow to test time restriction
        for(let i=0; i<50000000; i++){} // Making it very slow to test time restriction
        this.memory = this.memory + 1
        console.log ("Mi memoria me dice que este es mi minvimiento " + this.memory + "Soy el color "+ this.color)
        return moves[index]
    }
}


class HumanPlayer extends Agent {
    public board: Board;
    
    constructor(color : string) {
        super();
        this.board = new Board();
        this.color = color; 
    }
    
    compute(board : Array<Array<number>>, time : number) : [number, number, number] {
        const moves = this.board.valid_moves(board);
        for (const [index, move] of moves.entries()) {
            console.log(`Movimiento ${index}: Fila ${move[0]}, Columna ${move[1]}, Lado ${move[2]}`);
        }
        
        let userMove: [number, number, number];
        
        while (true) {
            // Solicitar al usuario que elija un movimiento
            const userInput : string | null = prompt(`Elija un movimiento (Fila, Columna, Lado), jugador ${this.color}:`);
            while (userInput == null) {
                const userInput : string | null = prompt(`Elija un movimiento (Fila, Columna, Lado), jugador ${this.color}:`);
            }
            const move = userInput.split(" ").map(value => parseInt(value,10));
            
            // Perform type check
            if (move.length !== 3 || !Number.isInteger(move[0]) || !Number.isInteger(move[1]) || !Number.isInteger(move[2])) {
                console.log("Movimiento inválido. Por favor, ingrese nuevamente.");
            } else {
                userMove = move as [number, number, number];
                return userMove;
            }
        }
    }
}

class BotPlayer extends Agent {
    public firstTime: boolean;
    public board: Board;
    public validMovesList: Array<[number, number, number]>;
    
    constructor(color : string) {
        super();
        this.firstTime = false;
        this.board = new Board();
        // this.cleanBoardMoves = [];
        this.color = color;
        this.validMovesList = [];
    }
    
    cleanBoard(board : Array<Array<number>>) {
        const moves : Array<[number, number, number]> = []
        // Iterate over all possible moves
        const boardValidMoves = this.board.valid_moves(board)
        const size = boardValidMoves.length
        // Iterate over all possible moves
        for (let i = 0; i < size; i++) {
            if (boardValidMoves[i][2] == 0 || boardValidMoves[i][2] == 3) {
                moves.push(boardValidMoves[i])
            }
        }
        this.validMovesList = moves
        if (!this.firstTime) {
            this.firstTime = true
            // We make a copy of the board like it was clean
        }
        return moves
    }
    
    compute(board: Array<Array<number>>, time: number) {
        //TODO
        return [0, 0, 0] as [number, number, number]
    }
}

/*
* Environment (Cannot be modified or any of its attributes accesed directly)
*/
class Environment extends MainClient{
    public board: any;
    public players: IPlayerMap;
    public size: any;
    public rb: any;
    public white: any;
    public black: any;
    public ptime: any;
    public player: any;
    public winner: any;
    
    constructor(){ 
        super()
        this.board = new Board()
        this.players = {}
    }
    
    setPlayers(players: IPlayerMap){ this.players = players }
    
    // Initializes the game 
    init(){ 
        const white = Konekti.vc('R').value // Name of competitor with red pieces
        console.log(white)
        const black = Konekti.vc('Y').value // Name of competitor with yellow pieces
        const time = 1000*parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        const size = parseInt(Konekti.vc('size').value) // Size of the reversi board
        
        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        const b1 = this.board.clone(this.rb)
        const b2 = this.board.clone(this.rb)
        
        this.white = white
        this.black = black
        this.ptime = {'R':time, 'Y':time}
        Konekti.vc('R_time').innerHTML = ''+time
        Konekti.vc('Y_time').innerHTML = ''+time
        this.player = 'R'
        this.winner = ''
        
        this.players[white].init('R', b1, time)
        this.players[black].init('Y', b2, time)
    }
    
    // Listen to play button 
    play(){ 
        const TIME = 10
        const x = this
        const board = x.board
        x.player = 'R'
        Konekti.vc('log').innerHTML = 'The winner is...'
        
        x.init()
        let start = -1
        
        function clock(){
            if(x.winner!='') return
            if(start==-1) setTimeout(clock,TIME)
                else{
                const end = Date.now()
                const ellapsed = end - start
                const remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player+'_time').innerHTML = remaining
                Konekti.vc((x.player=='R'?'Y':'R')+'_time').innerHTML = x.ptime[x.player=='R'?'Y':'R']
                
                if(remaining <= 0) x.winner = (x.player=='R'?x.black:x.white) + ' since ' + (x.player=='R'?x.white:x.black) + 'got time out'
                else setTimeout(clock,TIME) 
            }
        }
        
        function compute(){
            const w = x.player=='R'
            const id = w?x.white:x.black
            const nid = w?x.black:x.white
            const b = board.clone(x.rb)
            start = Date.now()
            const action = x.players[id].compute(b, x.ptime[x.player])
            const end = Date.now()
            const ply = (x.player=='R')?-1:-2
            const flag = board.move(x.rb, action[0], action[1], action[2], ply)
            if(!flag){
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            }else{
                const winner = board.winner(x.rb)
                if(winner!= ' ') x.winner = winner
                else{
                    const ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player+'_time').innerHTML = ''+x.ptime[x.player]
                    if(x.ptime[x.player] <= 0){ 
                        x.winner = nid + ' since ' + id + ' got run of time'
                    }else{
                        x.player = w?'Y':'R'
                    }
                }    
            }
            
            board.print(x.rb)
            start = -1
            if(x.winner=='') setTimeout(compute,TIME)
                else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }
        
        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands(){
    return [
        { 
            "command":" ", "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":255, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }
                
            ]},
            { 
                "command":"-", 
                "commands":[
                    {
                        "command":"strokeStyle",
                        "color":{"red":128, "green":128, "blue":128, "alpha":255}
                    },
                    {
                        "command":"polyline",
                        "x":[0,0,1,1,0],
                        "y":[0,1,1,0,0]
                    }
                ]
            },
            { 
                "command":"u", 
                "commands":[
                    {
                        "command":"strokeStyle",
                        "color":{"red":0, "green":0, "blue":255, "alpha":255}
                    },
                    {
                        "command":"polyline",
                        "x":[0,1],
                        "y":[0,0]
                    }
                ]
            },
            { 
                "command":"d", 
                "commands":[
                    {
                        "command":"strokeStyle",
                        "color":{"red":0, "green":0, "blue":255, "alpha":255}
                    },
                    {
                        "command":"polyline",
                        "x":[0,1],
                        "y":[1,1]
                    }
                ]
            },
            { 
                "command":"r", 
                "commands":[
                    {
                        "command":"strokeStyle",
                        "color":{"red":0, "green":0, "blue":255, "alpha":255}
                    },
                    {
                        "command":"polyline",
                        "x":[1,1],
                        "y":[0,1]
                    }
                ]
            },
            { 
                "command":"l", 
                "commands":[
                    {
                        "command":"strokeStyle",
                        "color":{"red":0, "green":0, "blue":255, "alpha":255}
                    },
                    {
                        "command":"polyline",
                        "x":[0,0],
                        "y":[0,1]
                    }
                ]
            },
            {
                "command":"R",
                "commands":[
                    {
                        "command":"fillStyle",
                        "color":{"red":255, "green":0, "blue":0, "alpha":255}
                    },
                    {
                        "command":"polygon",
                        "x":[0.2,0.2,0.8,0.8],
                        "y":[0.2,0.8,0.8,0.2]
                    }
                ]
            },  
            {
                "command":"Y",
                "commands":[
                    {
                        "command":"fillStyle",
                        "color":{"red":255, "green":255, "blue":0, "alpha":255}
                    },
                    {
                        "command":"polygon",
                        "x":[0.2,0.2,0.8,0.8],
                        "y":[0.2,0.8,0.8,0.2]
                    },
                ]
            }
        ] 
    }