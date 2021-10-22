import styles from "./style.module.scss";
import logoImg from "../../assets/logo.svg";
import { api } from "../../services/api";
import { useEffect, useState } from "react";
import io from 'socket.io-client';

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  };
};

const socket = io("http://localhost:4000");
const messagesQueue: Message[] = [];

socket.on("new_message", (newMessage : Message) => {
  messagesQueue.push(newMessage);
})

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    api.get<Message[]>("messages/last3").then((response) => {
      setMessages(response.data);
    });
  }, []);

  useEffect(() => {
    setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1]
        ].filter(Boolean))

        messagesQueue.shift();
      }
    }, 3000)
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="" />

      <ul className={styles.messageList}>
        {messages.map((Message) => {
          return (
            <li key={Message.id} className={styles.message}>
              <p className={styles.messageContent}>{Message.text}</p>
              <div className={styles.messageUser}>
                <div className={styles.userImage}>
                  <img src={Message.user.avatar_url} alt="" />
                </div>
                <span>{Message.user.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
