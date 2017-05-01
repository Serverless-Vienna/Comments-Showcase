import InlineStyleControls from './InlineStyleControls';
import BlockStyleControls from './BlockStyleControls';
import React from 'react';
import Draft from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import './RichEditorExample.css';

const {Editor, EditorState, RichUtils, ContentState} = Draft;

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
        this.state = { editorState: EditorState.createEmpty()};

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({ editorState });

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.onTab = (e) => this._onTab(e);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
        this.handleSubmit = () => this._handleSubmit();
        this.resetContent = this.resetContent.bind(this);
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
        if (this.state.editorState.getCurrentContent().hasText()) {
            const htmlContent = stateToHTML(this.state.editorState.getCurrentContent());
            this.props.publishContent(htmlContent);
        }
    }

    resetContent() {
      const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''));
      this.setState({ editorState });
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
                <input type="button" value="Submit" onClick={this.handleSubmit} disabled={!this.props.submitEnabled} />
                <input type="button" value="Reset" onClick={this.resetContent} disabled={!contentState.hasText()}/>
            </div>
        );
    }
}



export default RichEditorExample;
