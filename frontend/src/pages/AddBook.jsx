import { useState } from "react";
import { authFetch } from "../utils/api";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genres, setGenres] = useState("");
  const [description , setDescription] = useState("");
  const [photo , setphoto] = useState(null);
  const [preview , setpreview] = useState(null);
  const [pdfFile,setPdfFile] = useState(null);

  const handleFilechange = (e)=>{
    const file = e.target.files[0];
    setphoto(file);
  

    if(file){
      const reader = new FileReader();
      reader.onloadend = ()=> setpreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlepdfChange =(e) =>{
    const file = e.target.files[0];
    if(file && file.type === 'application/pdf'){
      setPdfFile(file);
    }else{
      alert("Please select a valid PDF file!. ")
    }
  };


    const handleDrop = async (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt.files && dt.files[0]) {
      // Local file dropped
      handleFilechange({ target: { files: dt.files } });
    } else if (dt.items && dt.items[0].kind === "string") {
      // URL dropped
      dt.items[0].getAsString(async url => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const file = new File([blob], "image.jpg", { type: blob.type });
          handleFilechange({ target: { files: [file] } });
        } catch {
          alert("Could not fetch image from URL.");
        }
      });
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData  = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append("genres", genres.split(",").map(g => g.trim()));
    formData.append("description", description);
    if(photo) formData.append("photo", photo);

    const res = await authFetch("/book/add", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if(data.error) alert(data.error);
    if(pdfFile){
      const pdfData = new FormData();
      pdfData.append('title',title);
      pdfData.append('author',author);
      pdfData.append('file',pdfFile)

      try{
        const pdfres = await authFetch('/bookai/upload',{
          method: "POST",
          body: pdfData
        });
        const pdfresult = await pdfres.json();
        console.log('pdf uploaded');
      }catch(err){
        console.log(err);
      }
    }
    alert("Book added successfully");
  };

return (
  <form className="addbook-form" onSubmit={handleSubmit}>
    <h2 className="addbook-title">Add Book</h2>
    <input
      className="addbook-input"
      placeholder="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />
    <input
      className="addbook-input"
      placeholder="Author"
      value={author}
      onChange={(e) => setAuthor(e.target.value)}
      required
    />
    <input
      className="addbook-input"
      placeholder="Eg Drama,Historical,Fiction "
      value={genres}
      onChange={(e) => setGenres(e.target.value)}
    />
    <textarea
      className="addbook-textarea"
      placeholder="Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
    />

    <div
      className="addbook-dropzone"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: "2px dashed var(--primary, #6366f1)",
        borderRadius: "12px",
        padding: "1.2rem",
        textAlign: "center",
        marginBottom: "1rem",
        background: "#f8fafc"
      }}
    >
        <p>Drag & drop an image here</p>
        <p>or click below to select a file</p>
        {preview && <img src={preview} alt="Preview" className="addbook-img" />}
    </div>
    <input
      className="addbook-file"
      type="file"
      accept="image/*"
      onChange={handleFilechange}
    />

    {preview && (
      <div className="addbook-preview">
        <p>Preview:</p>
        <img src={preview} alt="Preview" className="addbook-img" />
      </div>
    )}
    <div className="addbook-pdf">
      <label>Upload Book PDF(optional)</label>
      <input
        className="addbook-file"
        type="file"
        accept="application/pdf"
        onChange={handlepdfChange}
      />
      {pdfFile && <p>Selected PDF:{pdfFile.name}</p>}
    </div>

    <button className="addbook-btn" type="submit">Add</button>
  </form>
);
}

import '../App.css'
