import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";


interface AddNoteDialogProps {
    visible: boolean;
    images: string[];
    onAddPhoto: () => void;
    onTakePhoto: () => void;
    onCancel: () => void;
    onAdd: () => void;
}

const AddPhotoDialog : React.FC<AddNoteDialogProps> = ({ visible, images, onAddPhoto, onTakePhoto, onCancel, onAdd }) => {

    return (
        <Portal>
        <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>Add Photos</Dialog.Title>
        <Dialog.Content>
            <Button icon='plus' onPress={onAddPhoto}> Add Photo </Button>
            <Button icon='camera' onPress={onTakePhoto}> Take Photo </Button>
            <Text>Selected Photos: {images?.length}</Text>

        </Dialog.Content>
        <Dialog.Actions>
            <Button onPress={onCancel}>Cancel</Button>
            <Button onPress={onAdd}>Add</Button>
        </Dialog.Actions>
        </Dialog>
    </Portal>
    );
}

export default AddPhotoDialog;