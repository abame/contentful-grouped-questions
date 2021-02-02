import React, { useEffect, useState } from 'react';
import {
    Button,
    EditorToolbarButton,
    TextField,
    Textarea,
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

interface FieldProps {
    sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the Grouped Q&A app */
interface Item {
    id: string;
    question: string;
    group: string;
    anwser: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        question: '',
        group: '',
        anwser: '',
    };
}

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

    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event 
    */
    const createOnChangeHandler = (item: Item, property: 'question' | 'anwser' | 'group') => (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value });

        props.sdk.field.setValue(itemList);
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    return (
        <Accordion>
            {items.map((item) => (
                <AccordionItem key={item.id}>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            {item.group} - {item.question}
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
                                onChange={createOnChangeHandler(item, 'group')}
                            />
                            <label className='textareaLabel'>
                                Question: 
                            <Textarea
                                id="question"
                                name="question"
                                placeholder="Question"
                                value={item.question}
                                rows={10}
                                onChange={createOnChangeHandler(item, "question")}
                            />
                            </label>
                            <label className='textareaLabel'>
                                Answer: 
                                <Textarea
                                    id="anwser"
                                    name="anwser"
                                    placeholder="Answer"
                                    value={item.anwser}
                                    rows={10}
                                    onChange={createOnChangeHandler(item, "anwser")}
                                />
                            </label>
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

export default Field;
