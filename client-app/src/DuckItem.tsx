import React from 'react';
import { IDuck } from './typescript_stuff';

interface Props {
    duck: IDuck;
}

export default function DuckItem({duck}: Props) {
    return (
        <div>
          <span>{duck.name}</span>
          <button onClick={() => duck.makeSound!(duck.name + ' quack')}>Make Sound</button>
        </div>
    )
}