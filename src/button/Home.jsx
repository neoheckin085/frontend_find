import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Gambar from '../assets/IkasiMakassar.png';
import Gambar2 from '../assets/TlCavalary.png';
import Gambar3 from '../assets/PsmFans.png';
import Logo2 from '../assets/logoliquid.jpg';

const Home = () => {
  const [liked, setLiked] = useState([false, false, false]);
  const [comments, setComments] = useState([[], [], []]); // Array of comments for each post
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPost, setCurrentPost] = useState(null); // Track the current post for commenting
  const [newComment, setNewComment] = useState('');
  const [showLikeIcon, setShowLikeIcon] = useState([false, false, false]);

  const toggleLike = (index) => {
    const updatedLiked = [...liked];
    updatedLiked[index] = !updatedLiked[index];
    setLiked(updatedLiked);
  };

  const handleCommentPress = (index) => {
    setCurrentPost(index);
    setModalVisible(true);
  };

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      const updatedComments = [...comments];
      updatedComments[currentPost].push(newComment.trim());
      setComments(updatedComments);
      setNewComment('');
      setModalVisible(false);
    }
  };

  const handleDoubleTap = (index) => {
    if (!liked[index]) {
      toggleLike(index);
    }
    const updatedShowLikeIcon = [...showLikeIcon];
    updatedShowLikeIcon[index] = true;
    setShowLikeIcon(updatedShowLikeIcon);
    setTimeout(() => {
      updatedShowLikeIcon[index] = false;
      setShowLikeIcon([...updatedShowLikeIcon]);
    }, 1000); // Like icon will disappear after 1 second
  };
  

  const Card = ({ image, logo, title, description, index }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image style={styles.logo} source={logo} />
        <Text style={styles.judul}>{title}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDoubleTap(index)}
      >
        <Image style={styles.gambar} source={image} />
        {showLikeIcon[index] && (
          <View style={styles.likeIconContainer}>
            <Icon name="heart" size={60} color="#e74c3c" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleLike(index)}
        >
          <Icon
            name="heart"
            size={30} // Increased size of the like icon
            color={liked[index] ? '#e74c3c' : '#bdc3c7'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCommentPress(index)}
        >
          <Icon name="comment" size={30} color="#333" /> {/* Increased size of the comment icon */}
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardDescription}>
          <Text style={styles.cardTittle}>{title}</Text> - {description}
        </Text>
        {comments[index].length > 0 && (
          <View style={styles.commentSection}>
            {comments[index].map((comment, i) => (
              <Text key={i} style={styles.comment}>
                {comment}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <>
    <ScrollView contentContainerStyle={{flexGrow: 1, backgroundColor: 'white'}}>
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TextInput
                style={styles.input}
                placeholder="Type your comment here..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                <Button title="Add" onPress={handleAddComment} />
              </View>
            </View>
          </View>
        </Modal>
      )}
      <Card
        image={Gambar}
        logo={Gambar}
        title="IkasiMakassar"
        description="Sebagai salah satu dari Sebelas Fatui Harbinger, Arlecchino sangat menghormati Tsaritsa, meskipun dia menyatakan bahwa dia bersedia mengkhianati Tsaritsa jika kepentingan mereka berbeda. Arlecchino bekerja untuk mencapai tujuannya dengan memperoleh Gnose atas namanya. Dia menangani masalah Fatui dengan sangat penting dan tampil anggun dan ramah."
        index={0}
      />
      <Card
        image={Gambar2}
        logo={Logo2}
        title="TlCavalary"
        description="Sebagai salah satu dari Sebelas Fatui Harbinger, Arlecchino sangat menghormati Tsaritsa, meskipun dia menyatakan bahwa dia bersedia mengkhianati Tsaritsa jika kepentingan mereka berbeda. Arlecchino bekerja untuk mencapai tujuannya dengan memperoleh Gnose atas namanya. Dia menangani masalah Fatui dengan sangat penting dan tampil anggun dan ramah."
        index={1}
      />
      <Card
        image={Gambar3}
        logo={Gambar3}
        title="Psm Fans"
        description="Sebagai salah satu dari Sebelas Fatui Harbinger, Arlecchino sangat menghormati Tsaritsa, meskipun dia menyatakan bahwa dia bersedia mengkhianati Tsaritsa jika kepentingan mereka berbeda. Arlecchino bekerja untuk mencapai tujuannya dengan memperoleh Gnose atas namanya. Dia menangani masalah Fatui dengan sangat penting dan tampil anggun dan ramah."
        index={2}
      />
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  cardTittle: {
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
  },
  judul: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 2,
  },
  card: {
    margin: 0,
    borderRadius: 0,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gambar: {
    width: '100%',
    height: 450,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  likeIconContainer: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 15,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  actionButton: {
    marginRight: 20,
  },
  commentSection: {
    marginTop: 10,
  },
  comment: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 10
  },
});

export default Home;
