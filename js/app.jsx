/**
 * React Markdown Preview App
 */
const Provider = ReactRedux.Provider;
const connect = ReactRedux.connect;


/**
 * Output Component
 */
class PreviewOutput extends React.Component {

    constructor(props) {
        super(props);
    }
    render(){
        console.log("Render PreviewOutput Component.");
        console.log("PreviewOutput props : ");
        console.log(this.props);
        return(
            <div id="preview" className={`container-fluid h-100 anim-opacity border border-light rounded`} dangerouslySetInnerHTML={{ __html: this.props.output_text }} />
        )
    }
}

/**
 * Editor Component
 */
class PreviewEditor extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        const value = e.target.value;
        this.props.refreshPreview(value)
    }

    render(){
        console.log("Render PreviewEditor Component.");
        console.log("PreviewEditor props : ");
        console.log(this.props);



        return(
            <div className={`container-fluid h-100`}>
                <div className="form-floating h-100">
                    <textarea
                        id="editor"
                        name="editor"
                        className="form-control text-bg-dark h-100"
                        onChange={this.handleChange}
                        value={this.props.input_text}>

                    </textarea>
                    <label htmlFor="editor">Type your Markdown</label>

                </div>
            </div>
        )
    }
}

/**
 * Previewer Component
 */
class Previewer extends React.Component {

    constructor(props) {
        super(props);
        this.resizeStarted = false;
        this.mouseLeft = 0;
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    /**
     * Get stored Previewer panes sizes in local Storage
     * @return {*|null}
     */
    getStoredSize(){
        let storageData = localStorage.getItem("m8Prv_sizes");
        if(ut.isStr(storageData)){
            storageData = JSON.parse(storageData);
        }
        return (ut.isObject(storageData)) ? storageData.sizes : null;
    }

    /**
     * Save Previewer panes sizes in localStorage
     * @param data
     */
    setStoredSize(data){
        localStorage.setItem("m8Prv_sizes", JSON.stringify(data));
    }

    /**
     * Get default width styles for Previewer panes
     * @param size
     * @return {{visibility: string, width: string}|{visibility: string}}
     */
    getDefaultWidthStyle(size){
        if(size && size > 0){
            return {
                width: `${size}px`,
                visibility: 'visible'
            }
        }else{
            return{
                visibility: 'hidden'
            }
        }

    }

    /**
     * Used to set left position to Previewer resizer Bar
     * @param leftPos
     * @return {{left: string}|null}
     */
    getDefaultLeftStyle(leftPos){
        console.log(`getDefaultLeftStyle :------------------------------------>`);
        console.log(leftPos);
        if(ut.isPositiveNumber(leftPos)){
            return {
                left: `${leftPos}`
            };
        }
        return null;

    }

    /**
     * handleDragStart
     * @param e The react event handler
     */
    handleDragStart(e){
        // init drag event for firefox
        // see :
        //  - https://bugzilla.mozilla.org/show_bug.cgi?id=568313
        //  - https://bugzilla.mozilla.org/show_bug.cgi?id=646823#c4
        console.log(`handleDragStart :->`);
        this.resizeStarted = true;
        e.dataTransfer.setData('text/plain', 'node');
        // set invisible element to ghost drag image to hidden ghost image
        e.dataTransfer.setDragImage(e.target.lastChild, 0, 0);
        // handle dragover to get mouse position (firefox need it)
        // see: https://stackoverflow.com/questions/5798167/getting-mouse-position-while-dragging-js-html5
        document.ondragover = this.handleMouseMove;
    }

    /**
     * handleDrag
     * Update width values of left and right pane,
     * and update left position of resizer bar.
     * @param e The react event handler
     * @param left_pane_min min width of left pane
     * @param right_pane_min min width of right pane
     */
    handleDrag(e, left_pane_min = 0, right_pane_min = 0){
        console.log(`handleDrag :->`);
        //e.preventDefault()
        const line = e.target,
            editor = line.parentElement.firstChild,
            previewer = line.parentElement.lastChild,
            mouse_x = this.mouseLeft,
            w_editor = mouse_x - editor.offsetLeft,
            w_previewer = (previewer.offsetLeft + previewer.offsetWidth) - mouse_x;
        console.log(`Drag :-> mouse_x: ${mouse_x} -- w_editor: ${w_editor} -- w_previewer: ${w_previewer}`);
        if(mouse_x > left_pane_min &&  mouse_x < window.innerWidth - right_pane_min ){
            resizePane(editor, w_editor);
            resizePane(previewer, w_previewer);
            line.style.left = `${mouse_x}px`;
            console.log(`Resize Panes`);
            //console.log(e);
        }


    }
    handleDragEnd(e){
        console.log(`Drag End :->`);
        this.resizeStarted = false;
        const editor = e.target.parentElement.firstChild,
            previewer = e.target.parentElement.lastChild,
            resizer = e.target.parentElement.childNodes[1]
        this.setStoredSize({
            sizes: {
                w_editor: editor.offsetWidth,
                w_previewer: previewer.offsetWidth,
                l_line: resizer.offsetLeft,
            }
        })
        document.ondragover = null;
    }
    handleMouseMove(e){
        if(this.resizeStarted){
            console.log(`handleMouseMove :-> resizeStarted`);
            this.mouseLeft = e.pageX;
        }
    }

    componentWillUnmount() {
        document.ondragover = null;
    }

    render(){
        console.log("Render Previewer Component.");
        console.log("Previewer props : ");
        console.log(this.props);
        const storageData = this.getStoredSize();
        const editor_style = (storageData && storageData.w_editor) ? this.getDefaultWidthStyle(storageData.w_editor) : null;
        const preview_style = (storageData && storageData.w_previewer) ? this.getDefaultWidthStyle(storageData.w_previewer) : null;
        const resizer_style = (storageData && storageData.l_line) ? this.getDefaultLeftStyle(storageData.l_line) : null;
        console.log("editor_style : ------------------------------------------->");
        console.log(editor_style);
        return(
            <div id="previewer"
                 className={`d-flex justify-content-between overflow-hidden  min-vh-100`}>
                <div className="p-1 editor-container" style={editor_style ? editor_style : {}}>
                    <div className="card text-bg-dark h-100 border-light">
                        <div className="card-header border-light">Markdown Editor</div>
                        <div className="card-body">
                            <PreviewEditor input_text={this.props.input_text} refreshPreview={this.props.refreshPreview} />
                        </div>
                    </div>
                </div>
                <div
                    className="size-container"
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleDrag}
                    onDragEnd={this.handleDragEnd}
                    draggable="true"
                    style={resizer_style ? resizer_style : {}}>
                    <button type="button" className="btn btn-light">
                        <i className="fas fa-arrows-alt-h"></i>
                    </button>
                    <div className="ghost-drag"></div>
                </div>
                <div className="p-1  preview-container" style={preview_style ? preview_style : {}}>
                    <div className="card text-bg-dark h-100 border-light">
                        <div className="card-header border-light">Html Preview</div>
                        <div className="card-body">
                            <PreviewOutput output_text={this.props.output_text}  />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

/**
 * Error Box Message
 */
class ErrorBox extends React.Component {

    constructor(props) {
        super(props);
    }
    render(){
        console.log("Render ErrorBox Component.");
        console.log("ErrorBox props : ");
        console.log(this.props);
        return(
            <div className={`wrapper box-error`}>
                <div className="error-header">
                    <h1>Error :</h1>
                </div>
                <div className="error-message">
                    {this.props.error_msg}
                </div>
            </div>
        )
    }
}

/**
 * Main Root component
 **/
class Root extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        console.log("Render Root Component.");
        console.log("Root props : ");
        console.log(this.props);
        if(this.props.data){
            if(this.props.data.status === false){
                return(
                    <section className={`container-fluid`}>
                        <ErrorBox error_msg={this.props.data.data.error_msg} />
                    </section>
                )
            }else{
                return(
                    <section className="container-fluid min-vh-100">
                        <header><h1>Markdown Previewer App</h1></header>
                        <Previewer
                            input_text={this.props.data.input_text}
                            output_text={this.props.data.output_text}
                            refreshPreview={this.props.refreshPreview} />
                    </section>
                )
            }

        }
        else{
            console.log("Render Root Component and wait for quotes data.");
        }
    }
}

// React-Redux
const mapStateToProps = (state) => {
    return {data: state}
};

const mapDispatchToProps = (dispatch) => {
    return {
        refreshPreview: (text) => {
            console.log("Refresh Preview.");
            console.log("Dispatch data length.");
            console.log(text.length);
            dispatch(refreshPreview(text));
        }
    }
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Root);

class AppWrapper extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Container/>
            </Provider>
        );
    }
}


ReactDOM.render(<AppWrapper />, document.getElementById('main-app'));