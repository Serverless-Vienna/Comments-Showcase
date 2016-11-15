import InlineStyleControls from './InlineStyleControls';
import BlockStyleControls from './BlockStyleControls';
import React from 'react';
import Draft from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import sanitizeHtml from 'sanitize-html';


const {Editor, EditorState, RichUtils} = Draft;

// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

class RichEditorExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorState: EditorState.createEmpty(), buttonEnabled: true };

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({ editorState });

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.onTab = (e) => this._onTab(e);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.handleSubmit = () => this._handleSubmit();
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _onTab(e) {
        const maxDepth = 4;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    _handleSubmit() {
        console.log(this.state.editorState.getCurrentContent());
        if (this.state.editorState.getCurrentContent().hasText()) {
            this.setState( { buttonEnabled: false });
            const htmlContent = stateToHTML(this.state.editorState.getCurrentContent());
            const sanitizedContent = sanitizeHtml(htmlContent, {
                allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'ins', 'pre' ]
            });
            console.log('A comment was submitted: ' + htmlContent + ' ' + sanitizedContent);
            this.props.publishMessage(sanitizedContent, (success) => {
                this.setState({buttonEnabled: true})
                if (success) {
                    this.setState({editorState: EditorState.createEmpty()})
                }
            });
        } else {
            console.log('No comment typed');
        }
    }

    render() {
        const {editorState} = this.state;

        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        return (
            <div className="RichEditor-root">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                    />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                    />
                <div className={className} onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        onTab={this.onTab}
                        placeholder="Write a comment"
                        ref="editor"
                        spellCheck={true}
                        />
                </div>
                <input type="button" value="Submit" onClick={this.handleSubmit} disabled={!this.state.buttonEnabled} />
            </div>
        );
    }
}



export default RichEditorExample;
