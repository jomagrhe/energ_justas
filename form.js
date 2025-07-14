// Ejecuta el cídgo js despues que todo el DOM ha sido cargado
document.addEventListener("DOMContentLoaded", function(){
    // crea una constante que captura el botón por su id
    const sendInfo = document.getElementById("enviarBtn");
    // crea una evento que acciona el botón y ejecuta la función que contiene el formulario
    sendInfo.addEventListener("click", function(){
        getDatFomr();
    })
     // Función que contiene los datos del formulario y los ejecuta 
    function getDatFomr (){

        // crea constantes, luego a través de un método se puede acceder a los elementos por si ID
        const nameInp = document.getElementById("nombre");
        const emailInp = document.getElementById("correo");
        const phoneInp = document.getElementById("telefono");

        // crea constantes y obtienen el valor de las constantes anteriores, el trim elimina espacios en blanco em mbos extremos de una cadena
        const name = nameInp.value.trim();
        const email = emailInp.value.trim();
        const phone = phoneInp.value.trim();

        // Se crean dos variables para el manejo de errores
        let isValid = true;
        let errorMessage = '';
        
        // Se hacen las validaciones, si fallan genera un mensaje de error, de lo contrario el programa continua
        if (name === ''){
            errorMessage += 'El nombre completo es obligatorio. \n';
            isValid = false
        }

        if(email === ''){
            errorMessage += 'Debe ingresar un correo electrónico. \n';
            isValid = false
        }
        if (phone.length < 9){
            errorMessage += 'El número teléfonico debe tener como minimo 9 digitos. \n';
            isValid = false
        }
        // Se envia una alerta cuando hay un error y emvia el mensaje del error
        if (!isValid){
            alert('Por favor corríge los siguientes errores: \n ' + errorMessage);
            return;

        
        }
        console.log(name)
        console.log(email)
        console.log(phone)
    }
        

})

