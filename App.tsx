import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, } from 'react-native';
import {  FAB, PaperProvider, Text, } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import AddNoteDialog from './components/AddNoteDialog';
import DeleteNoteDialog from './components/DeleteNoteDialog';
import AddPhotoDialog from './components/AddPhotoDialog';
import LocationNotesList from './components/LocationNotesList';
import { LocationNote } from './types'

//Database initialization
let db : SQLite.SQLiteDatabase | null = null;

const initializeDatabase = async () : Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('locationNotes.db');
    await db.execAsync(`CREATE TABLE IF NOT EXISTS locationNotes (
                          id INTEGER PRIMARY KEY NOT NULL, 
                          locationName TEXT NOT NULL, 
                          description TEXT NOT NULL, 
                          latitude REAL NOT NULL, 
                          longitude REAL NOT NULL, 
                          time STRING NOT NULL,
                          date STRING NOT NULL,
                          images TEXT
                        );`
    );

    console.log("Database initialized successfully");
  
  } catch (err : any) {
    console.log("Error creating database:", err);
  }
};

//Fetch data from database
const fetchFromDatabase = async () : Promise<LocationNote[]> => {
  //Make sure database is initialized
  if (!db) {
    console.error("Database not initialized");
    return []; 
  }

  try {
    const resultData : LocationNote[] = await db.getAllAsync('SELECT * FROM locationNotes');

    return resultData.map((row : any) => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
    }));

  } catch (err : any) {
    console.log("Error fetching data:", err);
    return [];
  }
};

const App : React.FC = () : React.ReactElement =>  {

    const [locationErrorMsg, setLocationErrorMsg] = useState<string>('');

    const [errorMsg, setErrorMsg] = useState<string>('');

    const [addDialogVisible, setAddDialogVisible] = useState<boolean>(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
    const [addPhotoDialogVisible, setAddPhotoDialogVisible] = useState<boolean>(false);

    const [locationName, setLocationName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [images, setImages] = useState<string[]>([]);
    const [locationNotes, setLocationNotes] = useState<LocationNote[]>([]);

    const [noteToDelete, setNoteToDelete] = useState<LocationNote | null>(null);
    const [noteToAddPhoto, setNoteToAddPhoto] = useState<LocationNote | null>(null);

    //Image picker functions
    const pickImage = async () : Promise<void> => {
      let result : ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0].uri) {
        setImages((prevImages) => [...prevImages, result.assets[0].uri]);
      }
    };

    const takePhoto = async () : Promise<void> => {
      const { status }: { status: ImagePicker.PermissionStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
      if (status !== 'granted') {
        alert('Permission to access the camera is required!');
        return;
      }
    
      const result : ImagePicker.ImagePickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });
    
      if (!result.canceled && result.assets?.[0].uri) {
        setImages((prevImages) => [...prevImages, result.assets[0].uri]);
      }
    };

    //Get location
    const getLocation = async () : Promise<Location.LocationObject | undefined> => {
      try {
        const { status }: { status: Location.PermissionStatus } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocationErrorMsg('Permission to access location was denied');
          return;
        }

        return await Location.getCurrentPositionAsync({});

      } catch (err : any) {
        setLocationErrorMsg('An error occurred while fetching the location.');
        console.log("Error getting location:", err);
        return;
      }
    };

    //Dialog functions
    //For note adding
    const showAddDialog = () : void => {
      setAddDialogVisible(true);
    };

    const hideAddDialog = () : void => {
      setAddDialogVisible(false);
      setDescription('');
      setLocationName('');
    };

    //For note deleting
    const showDeleteDialog = (note : LocationNote) : void => {
      setDeleteDialogVisible(true);
      setNoteToDelete(note);
    };

    const hideDeleteDialog = () : void => {
      setDeleteDialogVisible(false);
      setNoteToDelete(null);
    };

    //For adding photos
    const showAddPhotoDialog = (note : LocationNote) : void => {
      setNoteToAddPhoto(note);
      setAddPhotoDialogVisible(true);
    };

    const hideAddPhotoDialog = () : void => {
      setNoteToAddPhoto(null);
      setAddPhotoDialogVisible(false);
      setImages([]);
    };

    //Database functions
    const addLocationNote = async () : Promise<void> => {

      let location : Location.LocationObject | undefined = await getLocation();

      if ( location?.coords && locationName.length > 0 && description.length > 0 ) {
        try {

          const noteDate : string = new Date(location.timestamp).toLocaleDateString();
          const noteTime : string = new Date(location.timestamp).toLocaleTimeString();

          await db?.runAsync('INSERT INTO locationNotes (locationName, description, latitude, longitude, time, date) VALUES (?, ?, ?, ?, ?, ?)',
                              [locationName, description, location.coords.latitude, location.coords.longitude, noteTime, noteDate]
                            );
          console.log("Location note added successfully");

          setLocationNotes(await fetchFromDatabase());

          hideAddDialog();
          setLocationErrorMsg('');

        } catch (err : any) {
          console.log("Error adding location note:", err);
        }
      } else {
        setErrorMsg('Please fill in all fields');
      }
    };

    const deleteNote = async () : Promise<void> => {
      if (!noteToDelete) return;
      
      try {
        await db?.runAsync('DELETE FROM locationNotes WHERE id = ?', [noteToDelete.id]);
        console.log("Location note deleted successfully");
        
        hideDeleteDialog();
        setLocationNotes(await fetchFromDatabase());

      } catch (err : any) {
        console.log("Error deleting location note:", err);
    }
  }

  const addPhotos = async (noteToAddPhoto : LocationNote, images : string[]) : Promise<void> => {
    try {

      const updatedImages : string[] = [...noteToAddPhoto?.images || [], ...images];

      await db?.runAsync('UPDATE locationNotes SET images = ? WHERE id = ?', [JSON.stringify(updatedImages), noteToAddPhoto.id]);

      console.log("Images added successfully");

      setLocationNotes(await fetchFromDatabase());
      hideAddPhotoDialog();

    } catch (err : any) {
      console.log("Error adding images", err);
    };
  }

    //On component mount
    useEffect(() => {
      const initializeAndFetch = async () : Promise<void> => {
        await initializeDatabase();
        setLocationNotes(await fetchFromDatabase());
      }

      initializeAndFetch();
    }, []);

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>

          <Text variant="headlineSmall" style={styles.title}>Location Notes</Text>

          {Boolean(locationErrorMsg) && <Text style={{color: 'red', marginBottom: 10}}>{locationErrorMsg}</Text>}

          <View style={styles.imageContainer}>
            <Image source={require('./assets/undraw_vintage_414k.png')} style={styles.image} resizeMode='contain'/>
          </View>

          <View style={styles.mainContainer}>

            <LocationNotesList 
              locationNotes={locationNotes} 
              showDeleteDialog={showDeleteDialog} 
              showAddPhotoDialog={showAddPhotoDialog} 
            />
          
            <AddNoteDialog
              visible={addDialogVisible}
              errorMsg={errorMsg}
              onChangeLocationName={setLocationName}
              onChangeDescription={setDescription}
              onCancel={hideAddDialog}
              onAdd={addLocationNote}
            />

            <DeleteNoteDialog 
              visible={deleteDialogVisible}
              noteToDelete={noteToDelete}
              onCancel={hideDeleteDialog}
              onDelete={deleteNote}
            />

            <AddPhotoDialog
              visible={addPhotoDialogVisible}
              images={images}
              onAddPhoto={pickImage}
              onTakePhoto={takePhoto}
              onCancel={hideAddPhotoDialog}
              onAdd={() => {
                if (noteToAddPhoto) {
                  addPhotos(noteToAddPhoto, images);
                }
              }}
            />
  
            <View style={styles.bottomCenterContainer}>
              <FAB
                icon="plus"
                label='Add location'
                onPress={showAddDialog}
                style={styles.buttonAdd}
              />
            </View>

          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  mainContainer: {
    flex : 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bottomCenterContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 15, 
    paddingBottom: 20,
  },
  buttonAdd : {
    borderRadius : 50,
  },
  title: {
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  imageContainer: {
    height: '40%', 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: -40, 
    marginTop: -40,
  },
  image: {
    height: '100%', 
    width: '80%', 
  },
  scrollViewContent: {
    padding: 5,
    paddingBottom: 80,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  }
});

export default App;