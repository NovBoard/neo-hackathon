import React, { useEffect, useState } from 'react';
import '../styles/Wallet.scss';
import { Div, Img, Input, Option, Select, Span, useIsMobile } from './Common';
import { useLocation } from 'react-router-dom';
import userAPI from '../api/userAPI';
import { isAddress } from "web3-validator";

// Modal 컴포넌트
const Modal = ({ onClose, onAdd }: { onClose: () => void, onAdd: (arg0: string, arg1: string) => void }) => {
    const [address, setAddress] = useState('');
    const [network, setNetwork] = useState('ethereum'); // 네트워크 상태 추가하기
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;

    const handleAddressChange = (event: any) => {
        setAddress(event.target.value);
    };

    const handleNetworkChange = (event: any) => { // 네트워크 변경 이벤트 핸들러 추가하기
        setNetwork(event.target.value);
    };

    const handleAddClick = async () => {
        // 서버에 새로운 지갑 주소 추가 요청 보내기
        try {
            if (network === "ethereum") { // 이더리움의 경우
                if (!isAddress(address)) {
                    alert("유효한 지갑 주소를 입력해주세요.");
                    return;
                }

                const walletAddresses = await userAPI.post("/get-wallets", { credential }).then(res => res.data.ethereum);
                if (walletAddresses.includes(address)) {
                    alert("이미 존재하는 지갑 주소입니다.");
                    return;
                }

                const response = await userAPI.post("/add-wallet", { credential, network, address });
                if (response.data.success) {
                    // 성공적이면 onAdd 함수 호출하기
                    onAdd(address, network);
                    onClose();
                } else {
                    // 실패하면 에러 메시지 표시하기
                    alert(response.data.message);
                }
            } else if (network === "gas") { // 가스의 경우
                const walletAddresses = JSON.parse(localStorage.getItem("gas") || "[]"); // 로컬 스토리지에서 지갑 주소 배열 가져오기
                if (walletAddresses.includes(address)) {
                    alert("이미 존재하는 지갑 주소입니다.");
                    return;
                }

                walletAddresses.push(address); // 새로운 지갑 주소 추가하기
                localStorage.setItem("gas", JSON.stringify(walletAddresses)); // 로컬 스토리지에 저장하기
                onAdd(address, network); // onAdd 함수 호출하기
                onClose();
            }
        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    };

    return (
        <Div className="modal-overlay">
            <Div className="modal-content">
                <Div className="modal-header">
                    <Img src="img/ExclamationCircleOutlined.svg" alt="닫기" className="modal-close-button" onClick={onClose} />
                    <Div className="modal-header-text">Track your crypto wallet address</Div>
                </Div>
                <Div className="modal-body">
                    <Div className="input-container">
                        <Div className="input-wrapper">
                            <Span className="input-wrapper-text">
                                <Select className="input-wrapper-select" value={network} onChange={handleNetworkChange}> {/* 드롭다운 메뉴 추가하기 */}
                                    <Option value="ethereum">ETH</Option>
                                    <Option value="gas">GAS</Option>
                                </Select>
                            </Span>
                            <Input className="input-wrapper-box" type="text" value={address} onChange={handleAddressChange} placeholder="wallet address" />
                            <Span className="input-wrapper-image"><Img src="img/CheckCircleTwoTone.svg" alt="도움말" className="input-suffix" /></Span>
                        </Div>
                    </Div>
                </Div>
                <Div className="modal-footer">
                    <Div className="modal-footer-cancel-button" onClick={onClose}>Cancel</Div>
                    <Div className="modal-footer-ok-button" onClick={handleAddClick}>Ok</Div>
                </Div>
            </Div>
        </Div>
    );
};

// 지갑 주소 컴포넌트
const WalletAddressItem = ({ address, network, onDelete }: { address: string, network: string, onDelete: (arg0: string, arg1: string) => void }) => {
    const loc = useLocation();
    const state = loc.state;
    const credential = state.credential;

    const handleDeleteClick = async () => {
        try {
            if (network === "ethereum") { // 이더리움의 경우
                const response = await userAPI.delete("/delete-wallet", { data: { credential, network, address } });
                if (response.data.success) {
                    // 성공적이면 onDelete 함수 호출하기
                    onDelete(address, network);
                } else {
                    // 실패하면 에러 메시지 표시하기
                    alert(response.data.message);
                }
            } else if (network === "gas") { // 가스의 경우
                const walletAddresses = JSON.parse(localStorage.getItem("gas") || "[]"); // 로컬 스토리지에서 지갑 주소 배열 가져오기
                const index = walletAddresses.indexOf(address); // 삭제할 지갑 주소의 인덱스 찾기
                if (index > -1) {
                    walletAddresses.splice(index, 1); // 지갑 주소 배열에서 삭제하기
                    localStorage.setItem("gas", JSON.stringify(walletAddresses)); // 로컬 스토리지에 저장하기
                    onDelete(address, network); // onDelete 함수 호출하기
                }
            }
        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    };

    return (
        <Div className="wallet-address-item">
            <Div className="wallet-address-item-text">{address}</Div>
            <Div className="wallet-address-item-image">
                <Img src="img/Button.svg" onClick={handleDeleteClick} /> {/* 이미지 클릭 이벤트 추가하기 */}
            </Div>
        </Div>
    );
};

const WalletAddressInputView = ({ wallets }: { wallets: string[] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [walletAddresses, setWalletAddresses] = useState([] as any);

    useEffect(() => {
        const gasWalletAddresses: string[] = JSON.parse(localStorage.getItem("gas") || "[]");
        const ethereumWallets = wallets.map(wallet => {
            return { address: wallet, network: "ethereum" }
        });
        const gasWallets = gasWalletAddresses.map(wallet => {
            return { address: wallet, network: "gas" }
        });

        setWalletAddresses(ethereumWallets.concat(gasWallets)); // 객체로 저장하기
    }, [wallets])

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addAddress = (newAddress: string, network: string) => { // 네트워크 파라미터 추가하기
        setWalletAddresses([...walletAddresses, { address: newAddress, network: network }]); // 객체로 저장하기
    };

    const deleteAddress = (deletedAddress: string, network: string) => { // 네트워크 파라미터 추가하기
        setWalletAddresses(walletAddresses.filter((a: any) => a.address !== deletedAddress || a.network !== network)); // 객체로 비교하기
    };

    return (
        <Div className="wallet-address-input">
            <Div className="wallet-address-input-item">
                <Div className="wallet-address-input-header-title">지갑 연결</Div>
                <Div className="wallet-address-input-header-text">암호화폐 지갑을 자유롭게 연결하세요</Div>
                <Div className="wallet-address-input-button" onClick={openModal}>
                    <Div>
                        <Img src={"img/Icon-Wrapper.svg"} alt="아이콘" />
                    </Div>
                    <Div>지갑 추가하기</Div>
                </Div>
            </Div>
            <Div className="wallet-address-input-item">
                <Div className="wallet-address-input-header-title">이더리움(ETH) 지갑 주소</Div>
                <Div className="wallet-address-items">
                    {walletAddresses.map((item: any, index: number) => (
                        <WalletAddressItem key={index} network={item.network} address={item.address} onDelete={deleteAddress} />
                    ))}
                </Div>
            </Div>
            {isModalOpen && <Modal onClose={closeModal} onAdd={addAddress} />}
        </Div>
    );
};

export { WalletAddressInputView };
