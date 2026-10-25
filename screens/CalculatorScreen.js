// screens/CalculatorScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ServiceButton from '../components/ServiceButton';
import { INITIAL_SERVICES, loadServiceCatalog } from '../services/serviceCatalog';
import { useAuth } from '../contexts/AuthContext';
import { addItemToCart } from '../services/localCommerce';

export default function CalculatorScreen({ navigation }) {
  const { user } = useAuth();
  const [servicios, setServicios] = useState(INITIAL_SERVICES);
  const [cantidad, setCantidad] = useState('');
  const [servicio, setServicio] = useState('');
  const [precio, setPrecio] = useState(0);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isActive = true;

    loadServiceCatalog().then((catalog) => {
      if (isActive) {
        setServicios(catalog);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const limpiarFormulario = () => {
    setCantidad('');
    setServicio('');
    setPrecio(0);
    setTotal(null);
    setError('');
  };

  const calcularTotal = () => {
    setNotice('');
    if (cantidad.trim() === '') {
      setError('Por favor, ingresa la cantidad de prendas.');
      setTotal(null);
      return;
    }

    const cantidadNumerica = parseFloat(cantidad);

    if (isNaN(cantidadNumerica)) {
      setError('La cantidad debe ser un número.');
      setTotal(null);
      return;
    }

    if (cantidadNumerica <= 0) {
      setError('La cantidad debe ser mayor que 0.');
      setTotal(null);
      return;
    }

    const servicioSeleccionado = servicios.find((item) => item.id === servicio);
    if (!servicioSeleccionado) {
      setError('Selecciona un tipo de servicio.');
      setTotal(null);
      return;
    }

    const precioServicio = Number(servicioSeleccionado.precio);
    const totalCalculado = cantidadNumerica * precioServicio;

    setPrecio(precioServicio);
    setTotal(totalCalculado.toFixed(2));
    setError('');
  };

  const agregarAlCarrito = async () => {
    setError('');
    setNotice('');

    const cantidadNumerica = Number(cantidad);
    if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setError('Para crear un pedido, ingresa una cantidad entera mayor que 0.');
      return;
    }

    const servicioSeleccionado = servicios.find((item) => item.id === servicio);
    if (!servicioSeleccionado) {
      setError('Selecciona un tipo de servicio.');
      return;
    }

    try {
      await addItemToCart(user.id, servicioSeleccionado, cantidadNumerica);
      setNotice('Servicio agregado al carrito.');
      navigation.navigate('Carrito');
    } catch (addError) {
      setError(addError.message || 'No se pudo actualizar el carrito.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>¿Cuántas prendas deseas lavar?</Text>

      <TextInput
        style={styles.input}
        placeholder="Cantidad de prendas"
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Selecciona un servicio:</Text>

      {servicios.filter((item) => item.activo).map((item) => (
        <ServiceButton
          key={item.id}
          nombre={item.nombre}
          precio={Number(item.precio)}
          seleccionado={servicio === item.id}
          onPress={() => setServicio(item.id)}
        />
      ))}

      <TouchableOpacity style={styles.primaryButton} onPress={calcularTotal}>
        <Text style={styles.primaryButtonText}>Calcular costo</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

      {total !== null ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>RESUMEN DEL LAVADO</Text>
          <Text style={styles.resultText}>Prendas: {cantidad}</Text>
          <Text style={styles.resultText}>
            Servicio: {servicios.find((item) => item.id === servicio)?.nombre}
          </Text>
          <Text style={styles.resultText}>Precio por prenda: S/ {precio.toFixed(2)}</Text>

          <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
          <Text style={styles.totalValue}>S/ {total}</Text>
        </View>
      ) : null}

      {total !== null ? (
        <TouchableOpacity style={styles.primaryButton} onPress={agregarAlCarrito}>
          <Text style={styles.primaryButtonText}>Agregar al carrito</Text>
        </TouchableOpacity>
      ) : null}

      <Pressable
        style={styles.clearButton}
        onPress={limpiarFormulario}
        onLongPress={limpiarFormulario}
      >
        <Text style={styles.clearButtonText}>Limpiar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    color: '#20495f',
    fontWeight: '700',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7e3ee',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
  },
  label: {
    fontSize: 17,
    color: '#2d4d5d',
    fontWeight: '600',
    marginBottom: 12,
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: '#1f9d75',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 14,
    color: '#c0392b',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noticeText: {
    marginTop: 14,
    color: '#176e57',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 22,
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfeaf5',
  },
  resultTitle: {
    fontSize: 18,
    color: '#1b3e53',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 15,
    color: '#375b6a',
    marginBottom: 6,
  },
  totalLabel: {
    marginTop: 14,
    fontSize: 16,
    color: '#1b3e53',
    fontWeight: '700',
    textAlign: 'center',
  },
  totalValue: {
    marginTop: 6,
    fontSize: 30,
    color: '#1f9d75',
    fontWeight: '800',
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 22,
    backgroundColor: '#eaf2f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d3e2f1',
  },
  clearButtonText: {
    color: '#365b6d',
    fontSize: 16,
    fontWeight: '700',
  },
});
