package com.techstore.product.service;

import com.techstore.product.model.Product;
import com.techstore.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> getByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public Product createProduct(Product product) {
        product.setCreatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updatedProduct) {
        Product existing = getProductById(id);
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setCategory(updatedProduct.getCategory());
        existing.setStock(updatedProduct.getStock());
        existing.setImageUrl(updatedProduct.getImageUrl());
        return productRepository.save(existing);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public long getTotalCount() {
        return productRepository.count();
    }
}
