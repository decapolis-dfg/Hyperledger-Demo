

   export const PostImage = async (file:any) => {
        const valiedTypes = ['image/jpg', 'image/png', 'image/jpeg'];
        if(!valiedTypes.find(type => type === file.type)){
            console.log("ERROR IN IMAGE TYPE")
            return;
        }

        const formData= new FormData();
        formData.append('image', file);
        var _tx = await fetch("http://localhost:5000/upload/",{ 
            method:'POST',
            body:formData
          } );
          const _response = await _tx.json();
          return _response;
    };

   export const RetriveAll = async () => {
        var images:string[] = []
        const _tx = await fetch("http://localhost:5000/images",{ 
            method:'GET',
          } );
          images = await _tx.json();
          return images;
    };

    export const RetriveObject = async (key:string) => {
        const _tx = await fetch(`http://localhost:5000/download/${key}`,{ 
            method:'GET',
          } );
          const hash = await _tx.json()
          // console.log(await _tx.json());
          return hash.hash;
          // console.log(await _tx.blob())
          // console.log(await _tx.json())
          // const _blob = await _tx.blob();
          // console.log(_blob);
          // let url = window.URL.createObjectURL(_blob);
          // console.log(url)
          // return url;
        //   let a = document.createElement('a');
            // a.href = url;
            // a.download = 'image.png';
            // a.click();
    };

