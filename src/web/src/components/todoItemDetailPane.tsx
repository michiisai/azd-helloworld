import { Text, DatePicker, Stack, TextField, PrimaryButton, DefaultButton, Dropdown, IDropdownOption, FontIcon } from '@fluentui/react';
import { useEffect, useState, FC, ReactElement, MouseEvent, FormEvent } from 'react';
import { TodoItem, TodoItemState } from '../models';
import { stackGaps, stackItemMargin, stackItemPadding, titleStackStyles } from '../ux/styles';
import CountdownTimer from './countdownTimer';
import TimePicker from './timePicker';

interface TodoItemDetailPaneProps {
    item?: TodoItem;
    onEdit: (item: TodoItem) => void
    onCancel: () => void
}

export const TodoItemDetailPane: FC<TodoItemDetailPaneProps> = (props: TodoItemDetailPaneProps): ReactElement => {
    const [name, setName] = useState(props.item?.name || '');
    const [description, setDescription] = useState(props.item?.description);
    const [dueDate, setDueDate] = useState(props.item?.dueDate);
    const [state, setState] = useState(props.item?.state || TodoItemState.Todo);

    useEffect(() => {
        setName(props.item?.name || '');
        setDescription(props.item?.description);
        setDueDate(props.item?.dueDate ? new Date(props.item?.dueDate) : undefined);
        setState(props.item?.state || TodoItemState.Todo);
    }, [props.item]);

    const saveTodoItem = (evt: MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();

        if (!props.item?.id) {
            return;
        }

        const todoItem: TodoItem = {
            id: props.item.id,
            listId: props.item.listId,
            name: name,
            description: description,
            dueDate: dueDate,
            state: state,
        };

        props.onEdit(todoItem);
    };

    const cancelEdit = () => {
        props.onCancel();
    }

    const onStateChange = (_evt: FormEvent<HTMLDivElement>, value?: IDropdownOption) => {
        if (value) {
            setState(value.key as TodoItemState);
        }
    }

    const onDueDateChange = (date: Date | null | undefined) => {
        if (date) {
            // If we have an existing dueDate with time, preserve the time when date changes
            if (dueDate) {
                const newDate = new Date(date);
                newDate.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0);
                setDueDate(newDate);
            } else {
                // Default to 5:00 PM for new dates
                const newDate = new Date(date);
                newDate.setHours(17, 0, 0, 0);
                setDueDate(newDate);
            }
        } else {
            setDueDate(undefined);
        }
    }

    const onTimeChange = (time: Date | null) => {
        if (time && dueDate) {
            // Preserve the date part, update the time part
            const newDate = new Date(dueDate);
            newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setDueDate(newDate);
        } else if (time && !dueDate) {
            // If time is set but no date, set to today with the selected time
            const newDate = new Date();
            newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setDueDate(newDate);
        }
    }

    const todoStateOptions: IDropdownOption[] = [
        { key: TodoItemState.Todo, text: 'To Do' },
        { key: TodoItemState.InProgress, text: 'In Progress' },
        { key: TodoItemState.Done, text: 'Done' },
    ];

    return (
        <Stack>
            {props.item &&
                <>
                    <Stack.Item styles={titleStackStyles} tokens={stackItemPadding}>
                        <Text block variant="xLarge">{name}</Text>
                        <Text variant="small">{description}</Text>
                        {dueDate && (
                            <Stack tokens={{ padding: '10px 0 0 0' }}>
                                <Text variant="medium" style={{ marginBottom: '8px' }}>Time Remaining:</Text>
                                <CountdownTimer 
                                    dueDate={new Date(dueDate)} 
                                    isCompleted={state === TodoItemState.Done}
                                />
                            </Stack>
                        )}
                    </Stack.Item>
                    <Stack.Item tokens={stackItemMargin}>
                        <TextField label="Name" placeholder="Item name" required value={name} onChange={(_e, value) => setName(value || '')} />
                        <TextField label="Description" placeholder="Item description" multiline size={20} value={description || ''} onChange={(_e, value) => setDescription(value)} />
                        <Dropdown label="State" options={todoStateOptions} required selectedKey={state} onChange={onStateChange} />
                        <DatePicker label="Due Date" placeholder="Due date" value={dueDate} onSelectDate={onDueDateChange} />
                        {dueDate && (
                            <TimePicker 
                                label="Due Time" 
                                value={dueDate} 
                                onTimeChange={onTimeChange} 
                            />
                        )}
                    </Stack.Item>
                    <Stack.Item tokens={stackItemMargin}>
                        <Stack horizontal tokens={stackGaps}>
                            <PrimaryButton text="Save" onClick={saveTodoItem} />
                            <DefaultButton text="Cancel" onClick={cancelEdit} />
                        </Stack>
                    </Stack.Item>
                </>
            }
            {!props.item &&
                <Stack.Item tokens={stackItemPadding} style={{ textAlign: "center" }} align="center">
                    <FontIcon iconName="WorkItem" style={{ fontSize: 24, padding: 20 }} />
                    <Text block>Select an item to edit</Text>
                </Stack.Item>}
        </Stack >
    );
}

export default TodoItemDetailPane;