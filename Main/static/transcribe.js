let mediaRecorder;
let audioChunks = [];

let client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
    clientId: 'mearm_Voice_Controls',
    reconnectPeriod: 1000
});

client.on('connect', () => {
    console.log("Connected to MQTT Broker");
    client.publish('me_arm/tesi/debug', 'Connected to MQTT Broker, client id: ' + client.options.clientId) ;
});

document.getElementById('recordButton').addEventListener('click', async () => {
    const button = document.getElementById('recordButton');

    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        button.innerText = "Start Recording";
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        // Processa l'audio ogni 2 secondi
        mediaRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
                const formData = new FormData();
                formData.append('audio', event.data, 'chunk.wav');

                try {
                    const response = await fetch('/transcribe_audio', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();
                    if (result.text.trim()) {
                        console.log("Transcribed:", result.text);

                        // Pubblica ogni parola sul canale MQTT
                        result.text.trim().split(/\s+/).forEach(word => {
                            const message = { voice: word };
                            client.publish('me_arm/tesi/raw_controls', JSON.stringify(message));
                        });

                        // Mostra nella pagina 
                        document.getElementById('result').innerText += " " + result.text;
                    }
                } catch (err) {
                    console.error("Transcription error:", err);
                }
            }
        };

        mediaRecorder.start(2000); // Invia ogni 2 secondi 
        button.innerText = "Stop Recording";
    }
});
