const ALCHEMY_API_KEY = "JpW6iTBHp1Ijz4KIFYPwgqTobISocoCf";
const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
let connectedWallet = null;
let images = [];

$(function() {
  $('#connect').click(connectWallet);
  $('#load_nfts').click(loadNfts);
});

const download = async function(e, url) {
  const canvas = document.getElementById('download_canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 2000;
  canvas.height = 2000;
  img = newImage(url);
  ctx.drawImage(
    img, 0, 0, 2000, 2000
  );

//const dataURL = canvas.toDataURL('image/png');
//await preloadAsync(dataURL)
//.then(function() {
//  const link = document.createElement('a');
//  link.href = dataURL;
//  link.download = 'image.png';
//  link.click();
//});
}

const downloadAll = function() {
  var zip = new JSZip();
  var images_folder = zip.folder("images");

  images.forEach(function(image) {
    images_folder.file(image, toObjectUrl(image), {base64: true});
    console.log(image)
  });

  zip.generateAsync({type:"blob"})
  .then(function(content) {
      saveAs(content, "collection.zip");
  });
}
const connectWallet = async function() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }

    if (connectedWallet) {
      disconnectWallet();
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    connectedWallet = accounts[0];
    console.log("Connected accounts:", accounts);
    showOwnerView();
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}
const showOwnerView = function() {
  $('#nfts').show();
  $("#wallet_address").text(`${connectedWallet}`);
  $('#connect').hide();
}

const loadNfts = async function() {
  try {
    const chain = $('#chain').val();
    const getNfts = `https://${chain}.reservoir.tools/users/${connectedWallet}/collections/v4`

//  curl --request GET \
//   --url https://api-apechain.reservoir.tools/users/0x9C9d2B1BC8f5EAdB17A5E3449Df3A470e96b14A9/collections/v4 \
//   --header 'accept: */*' \
//   --header 'x-api-key: 75eb4944-cf63-573e-ae89-96e43708ff70'

    const options = {
      method: 'GET',
      headers: {
        accept: '*/*',
        xApiKey: '75eb4944-cf63-573e-ae89-96e43708ff70',
        accessControlAllowOrigin: 'http://osideproject.io:3030',
        accessControlAllowCredentials: 'true'
      }
    }
    const nfts = await fetch(getNfts, options)
      .then(res => res.json())
      .catch(err => console.error(err));
    console.log(nfts);

    const nft_items = $('#nft_items');
    nft_items.empty();
    const nft_item = $('.nft_item')

    for (const nft of nfts) {
      console.log(nft.metadata);
      const tokenId = nft.tokenId;
      const metadata = nft.metadata;
      const attributes = metadata.attributes;
      let image = metadata.image;

      if (typeof(image) == 'undefined') { continue; }

      if (image.substr(0,4) == 'ipfs') {
        image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      images.push(image);

      nft_item_copy = nft_item.clone();
      nft_item_copy.find('.nft_name').text(metadata.name)
      nft_item_copy.attr('id',tokenId);
      nft_item_copy.find('.nft_image').append(`<img src="${image}" />`);

      nft_items.append(nft_item_copy);
      nft_item_copy.find('.download_image').click(function(e) { download(e, image) });
    }
  } catch (error) {
    console.error("Error fetching NFTs:", error);
  }
}
const newImage = function (f) {
  const img = new Image();
  img.src = f;
  img.crossOrigin="anonymous"
  return img;
}
const preload = function(src) {
  return new Promise(function(resolve, reject) {
    const img = new Image();
    img.onload = function() {
      return resolve(src);
    }
    img.onerror = function() {
      console.error('Failed to load image: ' + src);
    }
    img.src = src;
  });
}
const preloadAsync = async function(src) {
  return await preload(src);
}
