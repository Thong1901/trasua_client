import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import config from '../config/config';

const ProductCustomization = ({ 
  show, 
  onHide, 
  product, 
  onAddToCart 
}) => {
  const [customization, setCustomization] = useState({
    muc_ngot: 'vua',
    muc_da: 'vua',
    ghi_chu: ''
  });

  const mucNgotOptions = [
    { value: 'it_ngot', label: 'Ít ngọt', icon: '🍯' },
    { value: 'vua', label: 'Vừa ngọt', icon: '🥤' },
    { value: 'ngot', label: 'Ngọt', icon: '🍰' }
  ];

  const mucDaOptions = [
    { value: 'khong', label: 'Không đá', icon: '🌡️' },
    { value: 'it', label: 'Ít đá', icon: '🧊' },
    { value: 'vua', label: 'Vừa đá', icon: '❄️' },
    { value: 'nhieu', label: 'Nhiều đá', icon: '🧊🧊' }
  ];

  const handleCustomizationChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(product, customization);
    onHide();
    // Reset customization
    setCustomization({
      muc_ngot: 'vua',
      muc_da: 'vua',
      ghi_chu: ''
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!product) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Icons.Gear className="me-2" />
          Tùy chỉnh sản phẩm
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>        <Row>
          <Col md={4}>
            <div className="product-image-container position-relative">
              {product.hinhAnh ? (                <img 
                  src={config.getImageUrl(product.hinhAnh)}
                  alt={product.ten}
                  className="img-fluid rounded"
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                  }}
                />
              ) : null}
            </div>
          </Col>
          
          <Col md={8}>
            <h4>{product.ten}</h4>
            <p className="text-muted">{product.moTa || 'Sản phẩm chất lượng cao'}</p>
            <h5 className="text-primary">{formatPrice(product.gia)}</h5>
          </Col>
        </Row>

        <hr />

        <Form>
          {/* Mức độ ngọt */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              <Icons.Droplet className="me-2" />
              Mức độ ngọt
            </Form.Label>
            <Row>
              {mucNgotOptions.map(option => (
                <Col key={option.value} xs={4}>
                  <Form.Check
                    type="radio"
                    id={`ngot-${option.value}`}
                    name="muc_ngot"
                    value={option.value}
                    checked={customization.muc_ngot === option.value}
                    onChange={(e) => handleCustomizationChange('muc_ngot', e.target.value)}
                    label={
                      <div className="text-center">
                        <div style={{ fontSize: '1.5rem' }}>{option.icon}</div>
                        <small>{option.label}</small>
                      </div>
                    }
                    className="text-center"
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>

          {/* Mức độ đá */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              <Icons.Snow className="me-2" />
              Mức độ đá
            </Form.Label>
            <Row>
              {mucDaOptions.map(option => (
                <Col key={option.value} xs={3}>
                  <Form.Check
                    type="radio"
                    id={`da-${option.value}`}
                    name="muc_da"
                    value={option.value}
                    checked={customization.muc_da === option.value}
                    onChange={(e) => handleCustomizationChange('muc_da', e.target.value)}
                    label={
                      <div className="text-center">
                        <div style={{ fontSize: '1.2rem' }}>{option.icon}</div>
                        <small>{option.label}</small>
                      </div>
                    }
                    className="text-center"
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>

          {/* Ghi chú */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <Icons.ChatLeftText className="me-2" />
              Ghi chú thêm
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Ví dụ: thêm trân châu, ít đường..."
              value={customization.ghi_chu}
              onChange={(e) => handleCustomizationChange('ghi_chu', e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <Icons.X className="me-1" />
          Hủy
        </Button>
        <Button variant="primary" onClick={handleAddToCart}>
          <Icons.CartPlus className="me-1" />
          Thêm vào giỏ hàng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductCustomization;
