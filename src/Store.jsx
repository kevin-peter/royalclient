import React, { Component } from 'react'
const StoreContext = React.createContext()

export class Store extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: { ...localStorage }
    }
  }

  setItem = async (key, data, per = true) => {
    return new Promise((resolve, reject) => {
      try {
        let new_data = { ...this.state.data };
        if (key) {
          new_data[key] = data ? data : "";
          this.setState({
            data: new_data
          }, () => {
            if (typeof data === 'object') {
              data = JSON.stringify(data)
            }
            if (per) {
              localStorage.setItem(key, data)
            }
          })
        }
        resolve(data)
      } catch (error) {
        reject(false)
      }
    })
  }

  flushItem = async () => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.clear();
        this.setState({
          data: {}
        })
        resolve({})
      } catch (error) {
        reject(error)
      }
    })
  }

  getItem = (key) => {
    let data = '';
    if (this.state.data[key]) {
      data = this.state.data[key];
    } else if (localStorage.getItem(key)) {
      data = localStorage.getItem(key)
    }
    try {
      data = JSON.parse(data)
    } catch (e) {
    }
    return data;
  }

  openModal = () => {
    this.setState({
      data: {
        openmodal: true
      }
    })
  }

  closeModal = () => {
    this.setState({
      data: {
        openmodal: false
      }
    })
  }


  render() {

    const { children } = this.props
    const { data } = this.state
    const { openModal, closeModal, setItem, getItem, flushItem } = this

    return (
      <StoreContext.Provider
        value={{
          data,
          openModal,
          closeModal,
          setItem,
          getItem,
          flushItem
        }}
      >
        {children}
      </StoreContext.Provider>
    )
  }
}

export default StoreContext