import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import Artist from "../Artist.json"; // Make sure this path is correct

export default function ArtistsListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // Simulated loading time
    return () => clearTimeout(timer);
  }, []);

  const [artists] = useState([
    { id: '1', name: 'Lata Mangeshkar', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eba0199b159c0c5a9f62333d32' }] },
    { id: '2', name: 'Kishore Kumar', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebc9ac92d87de28795c1c49730' }] },
    { id: '3', name: 'Mohammed Rafi', images: [{ url: 'https://i.scdn.co/image/ab67616100005174261c13ddd720afec5c1dfd4e' }] },
    { id: '4', name: 'Mukesh', images: [{ url: 'https://i.scdn.co/image/ab67616d00001e0275dbcb9e8667f8183e1689bc' }] },
    { id: '5', name: 'Manna Dey', images: [{ url: 'https://i.scdn.co/image/ab6761610000517423ef8a548a5ae6925b70d106' }] },
    { id: '6', name: 'Asha Bhosle', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb7c6855a92b408b6f82f3e6d1' }] },
    { id: '7', name: 'Hemant Kumar', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb0bc24613a24f42b7ea2d193e' }] },
    { id: '8', name: 'Geeta Dutt', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb6ca54fc9555b6d4631ec6169' }] },
    { id: '9', name: 'Talat Mahmood', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb168fa44945dc03cb02319832' }] },
    { id: '10', name: 'S. P. Balasubrahmanyam', images: [{ url: 'https://i.scdn.co/image/ab67616100005174ea2b56271cf92bcff45c0ae9' }] },
    { id: '11', name: 'Arijit Singh', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb5ba2d75eb08a2d672f9b69b7' }] },
    { id: '12', name: 'Shreya Ghoshal', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb59303d54ce789210e745e1a9' }] },
    { id: '13', name: 'Armaan Malik', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebc5911f22814f270d5004ae53' }] },
    { id: '14', name: 'Neha Kakkar', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb77c63908ac248d3bf6d42f27' }] },
    { id: '15', name: 'Sonu Nigam', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebbc959d7569618ec2af2210f5' }] },
    { id: '16', name: 'Jubin Nautiyal', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebc58e9665446297c3be1a0ae0' }] },
    { id: '17', name: 'KK', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebb09a31f853166e721d4d46b2' }] },
    { id: '18', name: 'Shankar Mahadevan', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb3f27a828c24d73cf0427e2e7' }] },
    { id: '19', name: 'Sunidhi Chauhan', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eba45f7ef3e1c982461f2dad6b' }] },
    { id: '20', name: 'Atif Aslam', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebc40600e02356cc86f0debe84' }] },
    { id: '21', name: 'Palak Muchhal', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb0608ee2e47f6f470211831b9' }] },
    { id: '22', name: 'Mohit Chauhan', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb16691117e2ba803946b203ba' }] },
    { id: '23', name: 'Rahat Fateh Ali Khan', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebac45eaf028dc58810df0f382' }] },
    { id: '24', name: 'Badshah', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb7b386b1320742bd6686854e7' }] },
    { id: '25', name: 'Honey Singh', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebbc7e4fffd515b47ff1ebbc1f' }] },
    { id: '26', name: 'Diljit Dosanjh', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebfc043bea91ac91c222d235c9' }] },
    { id: '27', name: 'Asees Kaur', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb3f765cdf4d31f22a2ffed8be' }] },
    { id: '28', name: 'Darshan Raval', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eba80a803733f6a070e8f873fb' }] },
    { id: '29', name: 'Kanika Kapoor', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4ac8ab7f87a3c6cd69a49b00' }] },
    { id: '30', name: 'Shaan', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb2573d940f1062a6646891e50' }] },
    { id: '31', name: 'Adele', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb68f6e5892075d7f22615bd17' }] },
    { id: '32', name: 'Ed Sheeran', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2736567a393a964a845a89b7f70' }] },
    { id: '33', name: 'Taylor Swift', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676' }] },
    { id: '34', name: 'Drake', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9' }] },
    { id: '35', name: 'Billie Eilish', images: [{ url: 'https://i.scdn.co/image/ab67616d00001e022a038d3bf875d23e4aeaa84e' }] },
    { id: '36', name: 'The Weeknd', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb9e528993a2820267b97f6aae' }] },
    { id: '37', name: 'Justin Bieber', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36' }] },
    { id: '38', name: 'Selena Gomez', images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb815e520e3ce7fe210046ba66' }] },
    { id: '39', name: 'Shawn Mendes', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27304d6b1cca796816d03f4d698' }] },
    { id: '40', name: 'Dua Lipa', images: [{ url: 'https://i.scdn.co/image/ab67616d00001e022172b607853fa89cefa2beb4' }] },
  ]);

  const handleArtistClick = (artistName) => {
    navigate(`/albums/${encodeURIComponent(artistName)}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-center mb-8 text-3xl font-bold text-teal-200">
        Popular Artists
      </h2>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Lottie animationData={Artist} className="w-32 h-32" />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4">
          {artists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist.name)}
              className="flex-none w-44 text-center bg-[#121212] rounded-xl p-4 cursor-pointer transition-transform duration-300 hover:scale-105 hover:bg-[#1e1e1e]"
            >
              <img
                src={artist.images?.[0]?.url}
                alt={artist.name}
                className="w-36 h-36 object-cover rounded-full mx-auto mb-4 border-2 border-transparent hover:transition-all duration-300"
              />
              <div className="text-white font-semibold text-sm truncate">
                {artist.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
