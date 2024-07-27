import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, Timestamp, deleteField } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage , ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

const firebaseConfig1 = {
    apiKey: "AIzaSyDdPmw7EHBU-AwoDQ1szeW7WtHANaF30Q0",
    authDomain: "xo-game-c2506.firebaseapp.com",
    projectId: "xo-game-c2506",
    storageBucket: "xo-game-c2506.appspot.com",
    messagingSenderId: "1003496744924",
    appId: "1:1003496744924:web:34f59f5e9df9d261831119",
    measurementId: "G-701HCZH6H9"
};

const app1 = initializeApp(firebaseConfig1, "app1");
const db = getFirestore(app1);
const storage = getStorage(app1);

let temp = [],noteNumber;
loadTodo();
loadAllNotes();
if(document.getElementById("todoInput")){
document.getElementById("todoInput").addEventListener("keypress", async function(event) {
    if (event.key === "Enter") {
        let value = document.getElementById("todoInput").value;
        document.getElementById("todoInput").value = "";
        if (value !== '') {
            temp.push(value);
            const docRef = doc(db, "NoteVaultTodo", localStorage.getItem("MKA-Email"));
            await updateDoc(docRef, { unchecked: temp });
            loadTodo();
        }
    }
});
}
document.getElementById("dataList").addEventListener("click", async function(event) {
    if (event.target.tagName === "LI") {
        const index = event.target.getAttribute("data-index");
        if (index !== null) {
            const uncheckedItem = temp.splice(index, 1)[0];
            const docRef = doc(db, "NoteVaultTodo", localStorage.getItem("MKA-Email"));
            const docSnap = await getDoc(docRef);
            const checked = docSnap.data().checked || [];
            checked.push(uncheckedItem);
            await updateDoc(docRef, { unchecked: temp, checked });
            loadTodo();
        }
    }
});

async function loadTodo() { 
    const docRef = doc(db, "NoteVaultTodo", localStorage.getItem("MKA-Email"));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        document.getElementById("dataList").innerHTML = '';
        docSnap.data().unchecked.forEach((element, index) => {
            document.getElementById("dataList").innerHTML += `
                <li data-index="${index}" style="display: flex; align-items: center; justify-content: space-between; margin: 5px 0;">
                    ${element}
                    <img src="delPic.jpeg" onclick="delList(${index})" style="cursor: pointer; background-color: rgba(255, 0, 0, 0.65); border-radius: 50%; height: 20px; width: 20px;">
                </li>`;
        });
        docSnap.data().checked.forEach((element, index) => {
            document.getElementById("dataList").innerHTML += `
                <li style="display: flex; align-items: center; justify-content: space-between; margin: 5px 0; text-decoration: line-through;">
                    ${element}
                    <img class="delListBtn" src="delPic.jpeg" onclick="delCheckedList(${index})">
                </li>`;
        });
        temp = docSnap.data().unchecked;
    } else {
        await setDoc(doc(db, "NoteVaultTodo", localStorage.getItem("MKA-Email")), { unchecked: [], checked: [] });
        loadTodo();
    }
}

async function delList(index) {
    temp.splice(index, 1);
    const docRef = doc(db, "NoteVaultTodo", localStorage.getItem("MKA-Email"));
    await updateDoc(docRef, { unchecked: temp });
    loadTodo();
}

async function delCheckedList(index) {
    const docRef = doc(db, "NoteVaultTodo", localStorage.getItem("MKA-Email"));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const checked = docSnap.data().checked || [];
        checked.splice(index, 1);
        await updateDoc(docRef, { checked });
        loadTodo();
    }
}


async function loadAllNotes() {
    loader(10)
    document.getElementById('allNotes').innerHTML=''
    const docRef = doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email"));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        for (let i = 0; i < 100; i++) {
            let key = `Note${i}`;
            let note = docSnap.data()[key]; 
            if (note) {
                let noteBox=`<div class="noteBox" onClick="openModal('${key}')">`;
                    note.forEach((element, index) => {
                        if(index==0){
                            noteBox+=`<h1>${element}</h1>`
                        }else if(index==1){
                             noteBox+=`<p>${element}</p>`
                        }else if(index>2){
                            noteBox+=`<img class="noteImg" src="${element}">`
                        }


                    });
                    loader(30)
                    noteBox+="</div>"
                    document.getElementById('allNotes').innerHTML+=noteBox;
                    loader(30)
            }
        }
        loader(100)

    }
    loader(0)

}

async function openModal(i){
    loader(0)
    noteNumber=i;
    const docRef = doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email"));
    const docSnap = await getDoc(docRef);
            let note = docSnap.data()[i]; 
                    note.forEach((element, index) => {
                        if(index==0){
                            document.getElementById('exampleModalLabel').innerText=element;
                        }else if(index==1){
                            document.getElementById('contentSection').innerHTML=`<textarea class="contentBox" id="content" type='text'></textarea>`;
                            document.getElementById('content').value=element;
                        }else if(index==2){
                            document.getElementById('modalUpdateTime').innerText=convertTimestampToTime(element);
                        }else if(index>2){
                            document.getElementById('imgSection').innerHTML+=`<img src="${element}" onClick="openImg('${element}')">`;
                            console.log(element)
                        }
})

    $('#exampleModal').modal('show'); 
}

async function saveEdit() {
    let file = document.getElementById('newFile');
    let tempArray = [];
    const docRef = doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email"));
    const docSnap = await getDoc(docRef);

    // Check if document data exists and initialize tempArray
    if (docSnap.exists()) {
        tempArray = docSnap.data()[noteNumber] || [];
    

    if (file && file.files.length > 0) {
        const storageRef = ref(storage, `${file.files[0].name}`);
        const uploadTask = uploadBytesResumable(storageRef, file.files[0]);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                loader(progress); // Update progress

                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            }, 
            (error) => {
                console.log(error);
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    tempArray[1] = document.getElementById('content').value;
                    tempArray[2] = Timestamp.fromDate(new Date());
                    tempArray.push(downloadURL);
    
                    await updateDoc(docRef, {
                        [noteNumber]: tempArray
                    });
                    loadAllNotes();
                });
            }
        );
    } else {
        tempArray[1] = document.getElementById('content').value;
        tempArray[2] = Timestamp.fromDate(new Date());

        
        await updateDoc(docRef, {
            [noteNumber]: tempArray
        });
        loadAllNotes();
    }
    document.getElementById('imgSection').innerHTML=''
}
}


function loader(i){
    document.getElementById('loader').style.width=`${i}%`
}


function openImg(link) {
    window.open(link, '_blank');
}
function openCreateModal(){
    $('#createNotreModal').modal('show'); 
}
async function saveNewNote(){
    let newNoteTitle=document.getElementById('newNoteTitle').value;
    let newNoteContent=document.getElementById('newNoteContent').value;
    let file = document.getElementById('newNoteFile');
    let lastDigit=0;
    const docRef = doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email"));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        for (let i = 1; i < 100; i++) {
            let key = `Note${i}`;  
            if (docSnap.data().hasOwnProperty(key)) { 
                lastDigit = i;
            }
        }
        lastDigit++;
    }else{
        lastDigit=1;
    }
    if(newNoteContent=='' || newNoteTitle==''){
        alert('Fill all things')
    }else{
        $('#createNotreModal').modal('hide'); 

        if (file && file.files.length > 0) {
            const storageRef = ref(storage, `${file.files[0].name}`);
            const uploadTask = uploadBytesResumable(storageRef, file.files[0]);
    
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    loader(progress); // Update progress
    
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                }, 
                (error) => {
                    console.log(error);
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        let tempArray=[
                            newNoteTitle,
                            newNoteContent,
                            Timestamp.fromDate(new Date()),
                            downloadURL
                        ]
                        let abc=`Note${lastDigit}`
                        await setDoc(doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email")), {
                                [abc]:tempArray
                              });
                          });
                        }
        );
    }else{

        let tempArray=[
            newNoteTitle,
            newNoteContent,
            Timestamp.fromDate(new Date())
        ]
        let abc=`Note${lastDigit}`
        if(lastDigit==1){
            await setDoc(doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email")), {
                [abc]:tempArray
              });
        }else{
        await updateDoc(doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email")), {
                [abc]:tempArray
              });
            }
    }
                }
                document.getElementById('newNoteTitle').value=''
   document.getElementById('newNoteContent').value=''
    // document.getElementById('newNoteFile')=null
                loadAllNotes();
                
}

async function delNote() {
 
        const docRef = doc(db, "NoteVaultNotesData", localStorage.getItem("MKA-Email"));
        const docSnap = await getDoc(docRef);

    
        await updateDoc(docRef, {
            [noteNumber]: deleteField()  // Correct usage of deleteField()
        });

        console.log("Note deleted successfully!");
        $('#exampleModal').modal('hide'); 
        loadAllNotes();
    
}


window.delList = delList;
window.delCheckedList = delCheckedList;
window.openModal = openModal;
window.saveEdit=saveEdit;
window.openImg=openImg
window.openCreateModal=openCreateModal;
window.saveNewNote=saveNewNote;
window.delNote=delNote;





function convertTimestampToTime(timestamp) {
    // Convert the timestamp to milliseconds (if it's in seconds)
    let date = new Date(timestamp * 1000);

    // Format the date and time
    let formattedDate = date.toLocaleDateString();
    let formattedTime = date.toLocaleTimeString();

    return formattedDate + ' ' + formattedTime;
}