import React, { useEffect, useState } from 'react';
import {
    Button,
    EditorToolbarButton,
    TextField,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

// Demo styles, see 'Styles' section below for some notes on use.
import 'react-accessible-accordion/dist/fancy-example.css';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from 'ckeditor5-build-classic-dna';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

interface CKEditorEvent {
    name: string
}

interface CKEditorData {
    getData(): string
}

/** An Item which represents an list item of the Grouped Q&A app */
interface Item {
    id: string;
    question: string;
    group: string;
    answer: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        question: '',
        group: '',
        answer: '',
    };
}

const toolbarConfig = {
    toolbar: {
        items: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "indent",
            "outdent",
            "|",
            "codeBlock",
            "blockQuote",
            "mediaEmbed",
            "insertImageFromUnsplash",
            "undo",
            "redo",
            "|",
            "insertTable",
            "tableColumn",
            "tableRow",
            "mergeTableCells"
          ]
    }
};

/** The Field component is the Grouped Q&A App which shows up 
 * in the Contentful field.
 * 
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });
    });

    /** Adds another item to the list */
    const addNewItem = () => {
        props.sdk.field.setValue([...items, createItem()]);
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    const onChangeHandler = (item: Item, property: 'question' | 'answer' | 'group', data: string ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);
        itemList.splice(index, 1, { ...item, [property]: data });
        props.sdk.field.setValue(itemList);
    }

    return (
        <Accordion>
            {items.map((item) => (
                <AccordionItem key={item.id}>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            {item.group} - {truncate(item.question.replace(/(<([^>]+)>)/gi, ""), 65)}
                            <EditorToolbarButton
                                label="delete"
                                icon="Delete"
                                className="deleteButton"
                                onClick={() => deleteItem(item)}
                            />
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <div className='item'>
                            <TextField
                                id="group"
                                name="group"
                                labelText="Question Group"
                                value={item.group}
                                className="questionGroup"
                                onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                                    onChangeHandler(item, 'group', e.target.value)
                                }}
                            />
                            <label className='textareaLabel'>
                                Question:
                            </label>
                            <CKEditor
                                key="question"
                                editor={ ClassicEditor }
                                config={toolbarConfig}
                                data={item.question}
                                onChange={ ( event: CKEditorEvent, editor: CKEditorData ) => {
                                    onChangeHandler(item, 'question', editor.getData())
                                } }
                            />
                            <label className='textareaLabel'>
                                Answer:
                            </label>
                            <CKEditor
                                key="answer"
                                editor={ ClassicEditor }
                                config={toolbarConfig}
                                data={item.answer}
                                onChange={ ( event: CKEditorEvent, editor: CKEditorData ) => {
                                    onChangeHandler(item, 'answer', editor.getData())
                                } }
                            />
                        </div>
                    </AccordionItemPanel>
                </AccordionItem>
            ))}
            <Button
                buttonType="naked"
                onClick={addNewItem}
                icon="PlusCircle"
                style={{ marginTop: tokens.spacingS }}
            >
                Add New Question
            </Button>
        </Accordion>
    );
};

function truncate(source: string, size: number) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
}

export default Field;
