import { ScrollView, View, Image,  } from "react-native";
import { IconButton, List, Text, Button } from "react-native-paper";
import { LocationNote } from "../types";
import React from "react";

interface LocationNotesListProps {
    locationNotes : LocationNote[];
    showDeleteDialog: (note: LocationNote) => void;
    showAddPhotoDialog: (note: LocationNote) => void;
}

const LocationNotesList: React.FC<LocationNotesListProps> = ({ locationNotes, showDeleteDialog, showAddPhotoDialog }) => {

  const sortedLocationNotes : LocationNote[] = locationNotes.sort((a, b) => b.id - a.id);

    return (
        <ScrollView contentContainerStyle={{ padding: 5, paddingBottom: 80 }}>

        {(sortedLocationNotes.length > 0)
          ? sortedLocationNotes.map((note : LocationNote, idx : number) => {
            return (
              <List.Item
                key={idx}
                title={note.locationName}
                titleStyle={{fontWeight: 'bold', fontSize: 18, color: '#333', marginBottom: 5}}
                description={() => (
                  <View>
                    <Text style={{fontSize: 14, color: '#666', marginBottom: 5}}>{note.description}</Text>
                    <View style={{marginBottom: 5}}>
                      <Text style={{fontSize: 14, color: '#333', fontWeight: 'bold'}}>Coordinates:</Text>
                      <Text style={{ fontSize: 14, color: '#666'}}>
                        Lat: {note.latitude}{'\u00B0'}, Lon: {note.longitude}{'\u00B0'}
                      </Text>
                    </View>
                    <View style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, color: '#333', fontWeight: 'bold' }}>
                        Time & Date:
                      </Text>
                      <Text style={{ fontSize: 14, color: '#666' }}>
                        {note.time}   {note.date}
                      </Text>
                    </View>

                      <Button icon='plus' onPress={() => showAddPhotoDialog(note)}> Add Photo </Button>

                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginTop: 5,
                      }}
                    >
                      {note.images.map((uri: string, imageIdx: number) => (
                        <Image
                          key={imageIdx}
                          source={{ uri }}
                          style={{ width: 120, height: 120, marginRight: 5, marginBottom: 5, borderRadius: 5 }}
                          resizeMode="cover"
                        />
                      ))}
                  </View>
                  </View>
                )}
                right={props => <IconButton icon='delete' onPress={() => showDeleteDialog(note)} />}
                style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 10 }}
              /> 
            )
          })
          : <View style={{flex: 1, alignItems: 'center', justifyContent:'flex-start'}}>
              <Text>No location notes</Text>
            </View>
        }
       </ScrollView>
    );


};

export default LocationNotesList;