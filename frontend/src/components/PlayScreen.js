import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';

import api from '../utils/api';

const Content = styled.div`
  width: 800px;
  height: 600px;
  position: relative;
  background-color: #f0f1f2;
  box-shadow: 4px 4px 12px 2px rgba(0,0,0,0.2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 32px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Col = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
  align-items: center;
`;

const OuterGroud = styled.div`
  width: 100%;
  position: relative;
`;

const PlayGround = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  font-size: 18px;
`;

const CorrectWord = styled.span`
  text-decoration: underline;
  ${props => props.myWord && 'color: blue;'};
  ${props => props.enemyWord && 'color: red;'};
`;

const BlankWord = styled(CorrectWord)`
  text-decoration: none;
  opacity: 0.75;
`;

const InvisibleInput = styled.input`
  opacity: 0;
  position: absolute;
`;

const ResultBlock = styled.div`
  color: ${props => props.win ? 'green' : 'red'};
  font-weight: bold;
  font-size: 72px;
`;

const WordScreen = ({
  gameID,
  user,
  game,
  users,
  socket,
}) => {
  const [word, setWord] = useState('');
  const [ok, setOk] = useState(true);
  const inputRef = useRef();
  
  let myIndex = 0, enemyIndex = 1;
  if (game.players[1].userID === user.id) {
    myIndex = 1;
    enemyIndex = 0;
  }
  const myPlayer = (game && game.players && game.players.find(p => p.userID === user.id)) || {};
  const enemyPlayer = (game && game.players && game.players.find(p => p.userID !== user.id)) || {};

  const onType = (c) => {
    if (c.length === 1 && !myPlayer.finishedAt) {
      const newWord = word + c;
      const gameWord = game.paragraph[myPlayer.passIndex].word;
      if (gameWord.indexOf(newWord) === 0) {
        setWord(newWord);
        if (gameWord === newWord) {
          socket.emit('typing', {
            game_id: gameID,
            access_token: api.getAccessToken(),
            pass_index: myPlayer.passIndex + 1,
            ok,
          });
          setWord('');
          setOk(true);
        }
      } else {
        setOk(false);
      }
    }
  };

  const focusInput = () => {
    inputRef.current.focus();
  };

  const myScore = myPlayer.bonus && moment(myPlayer.finishedAt).diff(moment(game.startedAt), 'milliseconds') / 1000 + (!myPlayer.bonus.self && 5) + (myPlayer.bonus.enemy && -5);
  const enemyScore = enemyPlayer.bonus && moment(enemyPlayer.finishedAt).diff(moment(game.startedAt), 'milliseconds') / 1000 + (!enemyPlayer.bonus.self && 5) + (enemyPlayer.bonus.enemy && -5);

  return (
    <Content onClick={focusInput}>
      <Row>
        <Col>
          <OuterGroud>
            <PlayGround>
              {game.paragraph.filter((p, index) => true).map(p => (
                <BlankWord
                  myWord={p.bonus !== -1 && p.bonus === myIndex}
                  enemyWord={p.bonus !== -1 && p.bonus !== myIndex}
                >
                  {p.word}
                </BlankWord>
              ))}
            </PlayGround>
            <PlayGround>
              {game.paragraph.filter((p, index) => index < myPlayer.passIndex && true).map(p => (
                <CorrectWord
                  myWord={p.bonus !== -1 && p.bonus === myIndex}
                  enemyWord={p.bonus !== -1 && p.bonus !== myIndex}
                >
                  {p.word}
                </CorrectWord>
              ))}
              {myPlayer.passIndex < game.paragraph.length && (
                <CorrectWord
                  myWord={game.paragraph[myPlayer.passIndex].bonus !== -1 && game.paragraph[myPlayer.passIndex].bonus === myIndex}
                  enemyWord={game.paragraph[myPlayer.passIndex].bonus !== -1 && game.paragraph[myPlayer.passIndex].bonus !== myIndex}
                >
                  {word}
                </CorrectWord>
              )}
            </PlayGround>
            <InvisibleInput ref={inputRef} value="" onChange={e => onType(e.target.value)} />
          </OuterGroud>
          {myPlayer.finishedAt && enemyPlayer.finishedAt && (
            <ResultBlock win={myScore < enemyScore}>{myScore < enemyScore ? 'ชนะ' : 'แพ้'}</ResultBlock>
          )}
          {myPlayer.finishedAt && (
            <div>
              <span>{moment(myPlayer.finishedAt).diff(moment(game.startedAt), 'milliseconds') / 1000} </span>
              <span>{myPlayer.bonus.self === 0 && '+ 5'} </span> 
              <span>{myPlayer.bonus.enemy === 1 && '- 5'} </span>
              <span>= </span>
              <span>{myScore} </span>
              <span>วินาที</span>
            </div>
          )}
        </Col>
        <Col>
          <OuterGroud>
          <PlayGround>
              {game.paragraph.filter((p, index) => true).map(p => (
                <BlankWord
                  myWord={p.bonus !== -1 && p.bonus === enemyIndex}
                  enemyWord={p.bonus !== -1 && p.bonus !== enemyIndex}
                >
                  {p.word}
                </BlankWord>
              ))}
            </PlayGround>
            <PlayGround>
              {game.paragraph.filter((p, index) => index < enemyPlayer.passIndex && true).map(p => (
                <CorrectWord
                  myWord={p.bonus !== -1 && p.bonus === enemyIndex}
                  enemyWord={p.bonus !== -1 && p.bonus !== enemyIndex}
                >
                  {p.word}
                </CorrectWord>
              ))}
            </PlayGround>
          </OuterGroud>
          {myPlayer.finishedAt && enemyPlayer.finishedAt && (
            <ResultBlock win={myScore > enemyScore}>{myScore > enemyScore ? 'ชนะ' : 'แพ้'}</ResultBlock>
          )}
          {enemyPlayer.finishedAt && (
            <div>
              <span>{moment(enemyPlayer.finishedAt).diff(moment(game.startedAt), 'milliseconds') / 1000} </span>
              <span>{enemyPlayer.bonus.self === 0 && '+ 5'} </span>
              <span>{enemyPlayer.bonus.enemy === 1 && '- 5'} </span>
              <span>= </span>
              <span>{enemyScore} </span>
              <span>วินาที</span>
            </div>
          )}
        </Col>
      </Row>
    </Content>
  );
};

export default WordScreen;
