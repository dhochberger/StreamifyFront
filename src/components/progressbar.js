import React from 'react';

const ProgressBar = (props) => {
  const { bgcolor, completed } = props;

  const containerStyles = {
    height: 20,
    width: '100%',
    backgroundColor: "#13131b",
    borderRadius: 50,
    marginLeft: 30,
  }

  const fillerStyles = {
    height: '100%',
    width: `${completed}%`,
    backgroundColor: bgcolor,
    borderRadius: 'inherit',
    textAlign: 'right'
  }

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
      </div>
    </div>
  );
};

export default ProgressBar;
