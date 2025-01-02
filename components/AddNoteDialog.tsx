import { Button, Dialog, Portal, TextInput, Text } from "react-native-paper";

interface AddNoteDialogProps {
    visible: boolean;
    errorMsg: string;
    onChangeLocationName: (text: string) => void;
    onChangeDescription: (text: string) => void;
    onCancel: () => void;
    onAdd: () => void;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ visible, errorMsg, onChangeLocationName, onChangeDescription, onCancel, onAdd, }) => {
    
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
            <Dialog.Title>Add a new location</Dialog.Title>
            <Dialog.Content>
                {Boolean(errorMsg) && <Text style={{color: 'red', marginBottom: 10}}>{errorMsg}</Text>}
                <TextInput 
                label="Location name"
                mode='outlined'
                onChangeText={onChangeLocationName}
                />
                <TextInput 
                label="Description" 
                mode='outlined' 
                style={{marginTop: 10}}
                onChangeText={onChangeDescription}
                />

            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={onCancel}>Cancel</Button>
                <Button onPress={onAdd}>Add</Button>
            </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default AddNoteDialog;