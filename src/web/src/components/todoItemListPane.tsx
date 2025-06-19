import { CommandBar, DetailsList, DetailsListLayoutMode, IStackStyles, Selection, Label, Spinner, SpinnerSize, Stack, IIconProps, SearchBox, Text, IGroup, IColumn, MarqueeSelection, FontIcon, IObjectWithKey, CheckboxVisibility, IDetailsGroupRenderProps, getTheme, DatePicker, PrimaryButton, DefaultButton, TextField, Panel, PanelType } from '@fluentui/react';
import { ReactElement, useEffect, useState, FormEvent, FC } from 'react';
import { useNavigate } from 'react-router';
import { TodoItem, TodoItemState, TodoList } from '../models';
import { stackItemPadding } from '../ux/styles';
import CountdownTimer from './countdownTimer';
import TimePicker from './timePicker';

interface TodoItemListPaneProps {
    list?: TodoList
    items?: TodoItem[]
    selectedItem?: TodoItem;
    disabled: boolean
    onCreated: (item: TodoItem) => void
    onDelete: (item: TodoItem) => void
    onComplete: (item: TodoItem) => void
    onSelect: (item?: TodoItem) => void
}

interface TodoDisplayItem extends IObjectWithKey {
    id?: string
    listId: string
    name: string
    state: TodoItemState
    description?: string
    dueDate: Date | string
    completedDate: Date | string
    data: TodoItem
    createdDate?: Date
    updatedDate?: Date
}

const addIconProps: IIconProps = {
    iconName: 'Add',
    styles: {
        root: {
        }
    }
};

const createListItems = (items: TodoItem[]): TodoDisplayItem[] => {
    return items.map(item => ({
        ...item,
        key: item.id,
        dueDate: item.dueDate ? new Date(item.dueDate).toDateString() : 'None',
        completedDate: item.completedDate ? new Date(item.completedDate).toDateString() : 'N/A',
        data: item
    }));
};

const stackStyles: IStackStyles = {
    root: {
        alignItems: 'center'
    }
}

const TodoItemListPane: FC<TodoItemListPaneProps> = (props: TodoItemListPaneProps): ReactElement => {
    const theme = getTheme();
    const navigate = useNavigate();
    const [newItemName, setNewItemName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemDueDate, setNewItemDueDate] = useState<Date | undefined>();
    const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
    const [items, setItems] = useState(createListItems(props.items || []));
    const [selectedItems, setSelectedItems] = useState<TodoItem[]>([]);
    const [isDoneCategoryCollapsed, setIsDoneCategoryCollapsed] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selection = new Selection({
        onSelectionChanged: () => {
            const selectedItems = selection.getSelection().map(item => (item as TodoDisplayItem).data);
            setSelectedItems(selectedItems);
        }
    });

    // Handle list changed
    useEffect(() => {
        setIsDoneCategoryCollapsed(true);
        setSelectedItems([]);
    }, [props.list]);

    // Handle items changed
    useEffect(() => {
        const sortedItems = (props.items || []).sort((a, b) => {
            if (a.state === b.state) {
                return a.name < b.name ? -1 : 1;
            }

            return a.state < b.state ? -1 : 1;
        })
        setItems(createListItems(sortedItems || []));
    }, [props.items]);

    // Handle selected item changed
    useEffect(() => {
        if (items.length > 0 && props.selectedItem?.id) {
            selection.setKeySelected(props.selectedItem.id, true, true);
        }

        const doneItems = selectedItems.filter(i => i.state === TodoItemState.Done);
        if (doneItems.length > 0) {
            setIsDoneCategoryCollapsed(false);
        }

    }, [items.length, props.selectedItem, selectedItems, selection])

    const groups: IGroup[] = [
        {
            key: TodoItemState.Todo,
            name: 'Todo',
            count: items.filter(i => i.state === TodoItemState.Todo).length,
            startIndex: items.findIndex(i => i.state === TodoItemState.Todo),
        },
        {
            key: TodoItemState.InProgress,
            name: 'In Progress',
            count: items.filter(i => i.state === TodoItemState.InProgress).length,
            startIndex: items.findIndex(i => i.state === TodoItemState.InProgress)
        },
        {
            key: TodoItemState.Done,
            name: 'Done',
            count: items.filter(i => i.state === TodoItemState.Done).length,
            startIndex: items.findIndex(i => i.state === TodoItemState.Done),
            isCollapsed: isDoneCategoryCollapsed
        },
    ]

    const onFormSubmit = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();

        if (newItemName && props.onCreated) {
            const item: TodoItem = {
                name: newItemName,
                listId: props.list?.id || '',
                state: TodoItemState.Todo,
                description: newItemDescription || undefined,
                dueDate: newItemDueDate
            }
            props.onCreated(item);
            setNewItemName('');
            setNewItemDescription('');
            setNewItemDueDate(undefined);
            setShowAddTaskPanel(false);
        }
    }

    const onNewItemChanged = (_evt?: FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
        setNewItemName(value || '');
    }

    const onNewItemDescriptionChanged = (_evt?: FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
        setNewItemDescription(value || '');
    }

    const onNewItemDueDateChange = (date: Date | null | undefined) => {
        if (date) {
            // Default to 5:00 PM for new dates
            const newDate = new Date(date);
            newDate.setHours(17, 0, 0, 0);
            setNewItemDueDate(newDate);
        } else {
            setNewItemDueDate(undefined);
        }
    }

    const onNewItemTimeChange = (time: Date | null) => {
        if (time && newItemDueDate) {
            // Preserve the date part, update the time part
            const newDate = new Date(newItemDueDate);
            newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setNewItemDueDate(newDate);
        } else if (time && !newItemDueDate) {
            // If time is set but no date, set to today with the selected time
            const newDate = new Date();
            newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setNewItemDueDate(newDate);
        }
    }

    const selectItem = (item: TodoDisplayItem) => {
        navigate(`/lists/${item.data.listId}/items/${item.data.id}`);
    }

    const completeItems = () => {
        selectedItems.map(item => props.onComplete(item));
    }

    const deleteItems = () => {
        selectedItems.map(item => props.onDelete(item));
    }

    const columns: IColumn[] = [
        { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100 },
        { key: 'dueDate', name: 'Time Remaining', fieldName: 'dueDate', minWidth: 150 },
        { key: 'completedDate', name: 'Completed', fieldName: 'completedDate', minWidth: 100 },
    ];

    const groupRenderProps: IDetailsGroupRenderProps = {
        headerProps: {
            styles: {
                groupHeaderContainer: {
                    backgroundColor: theme.palette.neutralPrimary
                }
            }
        }
    }

    const renderItemColumn = (item: TodoDisplayItem, _index?: number, column?: IColumn) => {
        const fieldContent = item[column?.fieldName as keyof TodoDisplayItem] as string;

        switch (column?.key) {
            case "name":
                return (
                    <>
                        <Text variant="small" block>{item.name}</Text>
                        {item.description &&
                            <>
                                <FontIcon iconName="QuickNote" style={{ padding: "5px 5px 5px 0" }} />
                                <Text variant="smallPlus">{item.description}</Text>
                            </>
                        }
                    </>
                );
            case "dueDate":
                if (item.data.dueDate) {
                    return (
                        <CountdownTimer 
                            dueDate={new Date(item.data.dueDate)} 
                            isCompleted={item.state === TodoItemState.Done}
                        />
                    );
                } else {
                    return <Text variant="small" style={{ color: '#605e5c' }}>No due date</Text>;
                }
            default:
                return (<Text variant="small">{fieldContent}</Text>)
        }
    }

    return (
        <Stack>
            <Stack.Item>
                <form onSubmit={onFormSubmit}>
                    <Stack horizontal styles={stackStyles}>
                        <Stack.Item grow={1}>
                            <SearchBox value={newItemName} placeholder="Add an item" iconProps={addIconProps} onChange={onNewItemChanged} disabled={props.disabled} />
                        </Stack.Item>
                        <Stack.Item>
                            <PrimaryButton 
                                text="Add with Details" 
                                iconProps={{ iconName: 'Add' }}
                                onClick={() => setShowAddTaskPanel(true)}
                                disabled={props.disabled}
                                style={{ marginLeft: '8px' }}
                            />
                        </Stack.Item>
                        <Stack.Item>
                            <CommandBar
                                items={[
                                    {
                                        key: 'markComplete',
                                        text: 'Mark Complete',
                                        disabled: props.disabled,
                                        iconProps: { iconName: 'Completed' },
                                        onClick: () => { completeItems() }
                                    },
                                    {
                                        key: 'delete',
                                        text: 'Delete',
                                        disabled: props.disabled,
                                        iconProps: { iconName: 'Delete' },
                                        onClick: () => { deleteItems() }
                                    }
                                ]}
                                ariaLabel="Todo actions" />
                        </Stack.Item>
                    </Stack>
                </form>
            </Stack.Item>
            
            <Panel
                headerText="Add New Task"
                isOpen={showAddTaskPanel}
                onDismiss={() => setShowAddTaskPanel(false)}
                type={PanelType.medium}
            >
                <Stack tokens={{ childrenGap: 16 }}>
                    <TextField 
                        label="Task Name" 
                        placeholder="Enter task name" 
                        required
                        value={newItemName}
                        onChange={onNewItemChanged}
                    />
                    <TextField 
                        label="Description" 
                        placeholder="Enter task description (optional)" 
                        multiline
                        rows={3}
                        value={newItemDescription}
                        onChange={onNewItemDescriptionChanged}
                    />
                    <DatePicker 
                        label="Due Date (optional)" 
                        placeholder="Select due date"
                        value={newItemDueDate}
                        onSelectDate={onNewItemDueDateChange}
                    />
                    {newItemDueDate && (
                        <TimePicker 
                            label="Due Time" 
                            value={newItemDueDate} 
                            onTimeChange={onNewItemTimeChange} 
                        />
                    )}
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                        <PrimaryButton 
                            text="Add Task" 
                            onClick={(e) => onFormSubmit(e as any)}
                            disabled={!newItemName.trim()}
                        />
                        <DefaultButton 
                            text="Cancel" 
                            onClick={() => {
                                setShowAddTaskPanel(false);
                                setNewItemName('');
                                setNewItemDescription('');
                                setNewItemDueDate(undefined);
                            }}
                        />
                    </Stack>
                </Stack>
            </Panel>
            {items.length > 0 &&
                <Stack.Item>
                    <MarqueeSelection selection={selection}>
                        <DetailsList
                            items={items}
                            groups={groups}
                            columns={columns}
                            groupProps={groupRenderProps}
                            setKey="id"
                            onRenderItemColumn={renderItemColumn}
                            selection={selection}
                            layoutMode={DetailsListLayoutMode.justified}
                            selectionPreservedOnEmptyClick={true}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="select row"
                            checkboxVisibility={CheckboxVisibility.always}
                            onActiveItemChanged={selectItem} />
                    </MarqueeSelection>
                </Stack.Item>
            }
            {!props.items &&
                <Stack.Item align="center" tokens={stackItemPadding}>
                    <Label>Loading List Items...</Label>
                    <Spinner size={SpinnerSize.large} labelPosition="top" /> 
                </Stack.Item>
            }
            {props.items && items.length === 0 &&
                <Stack.Item align="center" tokens={stackItemPadding}>
                    <Text>This list is empty.</Text>
                </Stack.Item>
            }
        </Stack>
    );
};

export default TodoItemListPane;