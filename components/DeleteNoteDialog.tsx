import { Button, Dialog, Portal, Text } from "react-native-paper";
import { LocationNote } from "../types";

interface DeleteNoteDialogProps {
    visible: boolean;
    noteToDelete: LocationNote | null;
    onCancel: () => void;
    onDelete: () => void;
}

const DeleteNoteDialog: React.FC<DeleteNoteDialogProps> = ({ visible, noteToDelete, onCancel, onDelete }) => {

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
            <Dialog.Title>Delete Item</Dialog.Title>
            <Dialog.Content>
                <Text>Are you sure you want to delete item:</Text>
                <Text>{noteToDelete?.locationName}</Text>
                <Text>{noteToDelete?.description}</Text>
            </Dialog.Content>
                <Dialog.Actions>
                <Button onPress={onCancel}>Cancel</Button>
                <Button onPress={onDelete}>Delete</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal> 
    );
};

export default DeleteNoteDialog;